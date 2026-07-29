import cv2
import numpy as np
import json, os

ASSETS = "/Users/kevinsmith/Desktop/theia-starter-template/src/assets"
OUT = "/Users/kevinsmith/Desktop/theia-starter-template/.sts_mask"

# image file -> (key, expected ship count)
IMAGES = {
    "HAfSz3HbAAA34GM.jpeg": ("count2", 2),
    "sts_raft_3.png": ("count3", 3),
    "sts_raft_4.png": ("count4", 4),
    "sts_raft_5.png": ("count5", 5),
}


def water_distance(img):
    # Estimate water color from a border frame, return per-pixel distance in Lab.
    lab = cv2.cvtColor(img, cv2.COLOR_BGR2LAB).astype(np.float32)
    h, w = img.shape[:2]
    b = max(4, min(h, w) // 40)
    frame = np.concatenate(
        [
            lab[:b, :, :].reshape(-1, 3),
            lab[-b:, :, :].reshape(-1, 3),
            lab[:, :b, :].reshape(-1, 3),
            lab[:, -b:, :].reshape(-1, 3),
        ]
    )
    water = np.median(frame, axis=0)
    dist = np.linalg.norm(lab - water, axis=2)
    return dist


def segment(path, n):
    img = cv2.imread(path)
    h, w = img.shape[:2]
    dist = water_distance(img)
    color = cv2.normalize(dist, None, 0, 255, cv2.NORM_MINMAX)
    # Texture channel: ships carry deck structure (high local variance); open
    # water is smooth. This catches dark hulls that blend into navy water.
    gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY).astype(np.float32)
    K = max(3, (w // 80) | 1)
    mean = cv2.blur(gray, (K, K))
    sq = cv2.blur(gray * gray, (K, K))
    std = np.sqrt(np.maximum(sq - mean * mean, 0))
    texture = cv2.normalize(std, None, 0, 255, cv2.NORM_MINMAX)
    # Combine: a pixel is "ship" if it differs in color OR is textured.
    score = cv2.max(color, texture).astype(np.uint8)
    _, mask = cv2.threshold(score, 0, 255, cv2.THRESH_BINARY + cv2.THRESH_OTSU)
    # Clean up ripples/wakes; fill hull interior (decks, shadows).
    k = max(3, min(h, w) // 220) | 1
    mask = cv2.morphologyEx(mask, cv2.MORPH_OPEN, np.ones((k, k), np.uint8), iterations=2)
    mask = cv2.morphologyEx(mask, cv2.MORPH_CLOSE, np.ones((k * 3, k * 3), np.uint8), iterations=2)

    # Flood-fill holes so each hull is a solid blob (dark decks don't punch gaps).
    ff = mask.copy()
    fmask = np.zeros((h + 2, w + 2), np.uint8)
    cv2.floodFill(ff, fmask, (0, 0), 255)
    mask = mask | cv2.bitwise_not(ff)

    debug = img.copy()

    def trace(region):
        cnts, _ = cv2.findContours(region, cv2.RETR_EXTERNAL, cv2.CHAIN_APPROX_SIMPLE)
        if not cnts:
            return None
        c = max(cnts, key=cv2.contourArea)
        if cv2.contourArea(c) < (h * w) * 0.0004:
            return None
        peri = cv2.arcLength(c, True)
        approx = cv2.approxPolyDP(c, 0.005 * peri, True)
        return approx

    polys = []
    if n <= 2:
        # Isolated ships: connected components separate cleanly.
        num, labels, stats, cent = cv2.connectedComponentsWithStats(mask)
        comps = sorted(
            [(stats[i, cv2.CC_STAT_AREA], i, cent[i][0]) for i in range(1, num)],
            reverse=True,
        )[:n]
        comps.sort(key=lambda c: c[2])
        for _, i, _ in comps:
            approx = trace((labels == i).astype(np.uint8) * 255)
            if approx is None:
                continue
            polys.append(approx)
    else:
        # Rafts: hulls touch hull-to-hull along the body (no water between them),
        # so the blob only splays apart at the bows. First drop stray specks
        # (watermarks, wake glints) so the raft's x-extent is clean, then cut n
        # even lanes and trace each — organic bow / stern / outer edges, straight
        # interior seams where hulls abut.
        num, labels, stats, _ = cv2.connectedComponentsWithStats(mask)
        keep = np.zeros_like(mask)
        for i in range(1, num):
            if stats[i, cv2.CC_STAT_AREA] > (h * w) * 0.02:
                keep[labels == i] = 255
        mask = keep if keep.any() else mask
        ys, xs = np.where(mask > 0)
        x_min, x_max = xs.min(), xs.max()
        span = x_max - x_min
        # Evenly space lanes across the raft (guarantees n non-empty lanes since
        # each band contains part of the blob), then nudge each seam to the
        # nearest column-coverage valley (the water gap) within a small window.
        bounds = [x_min]
        for a in range(1, n):
            bounds.append(int(round(x_min + span * a / n)))
        bounds.append(x_max + 1)
        for a in range(n):
            band = np.zeros_like(mask)
            x0, x1 = bounds[a], bounds[a + 1]
            band[:, x0:x1] = mask[:, x0:x1]
            approx = trace(band)
            if approx is None:
                continue
            polys.append(approx)

    out_polys = []
    for approx in polys:
        pts = approx.reshape(-1, 2).astype(float)
        out_polys.append([[round(x / w, 4), round(y / h, 4)] for x, y in pts])
        cv2.drawContours(debug, [approx], -1, (0, 255, 255), 2)

    cv2.imwrite(os.path.join(OUT, f"debug_{os.path.basename(path)}.png"), debug)
    cv2.imwrite(os.path.join(OUT, f"mask_{os.path.basename(path)}.png"), mask)
    return {"w": w, "h": h, "ships": out_polys}


result = {}
for fname, (key, n) in IMAGES.items():
    r = segment(os.path.join(ASSETS, fname), n)
    result[key] = r
    print(key, "ships found:", len(r["ships"]), "pts:", [len(p) for p in r["ships"]])

with open(os.path.join(OUT, "masks.json"), "w") as f:
    json.dump(result, f)
print("wrote masks.json")
