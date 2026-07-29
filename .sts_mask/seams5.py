import numpy as np
from PIL import Image

a = np.asarray(Image.open('src/assets/sts_raft_5.png').convert('RGB')).astype(np.int32)
H, W, _ = a.shape
water = a[:, :30, :].reshape(-1, 3).mean(axis=0)
dist = np.sqrt(((a - water) ** 2).sum(axis=2))
mask = dist > 55

# vertical band where all 5 hull bodies overlap (mid-ship)
y0, y1 = 360, 470
band = mask[y0:y1]
col = band.sum(axis=0).astype(float)
col = np.convolve(col, np.ones(9) / 9, mode='same')
xs = np.where(col > 0.5 * (y1 - y0))[0]
raftL, raftR = xs.min(), xs.max()
print('raft x', raftL, raftR, 'width', raftR - raftL)

# brightness (deck) profile to find hull centers/seams
gray = a[y0:y1].mean(axis=2).mean(axis=0)
gray = np.convolve(gray, np.ones(7) / 7, mode='same')
region = gray[raftL:raftR]
# seams = local minima (dark gaps between hulls)
seams = []
for x in range(raftL + 40, raftR - 40):
    w = gray[x - 12:x + 12]
    if gray[x] == w.min() and gray[x] < np.median(region) * 0.9:
        if all(abs(x - s) > 60 for s in seams):
            seams.append(x)
print('candidate seams', seams)

# Fallback: even split into 5
bounds = [raftL] + seams + [raftR]
if len(seams) != 4:
    print('using even split')
    bounds = [raftL + (raftR - raftL) * i / 5 for i in range(6)]
print('bounds', [int(b) for b in bounds])

# per-hull vertical extent (bow/stern) within its x-slice
for i in range(len(bounds) - 1):
    xa, xb = int(bounds[i]), int(bounds[i + 1])
    sub = mask[:, xa:xb]
    w = xb - xa
    rows = np.where(sub.sum(axis=1) > 0.30 * w)[0]
    if rows.size:
        print(f'hull{i}: x {xa}-{xb} (w {xb-xa}) y {rows.min()}-{rows.max()}')
