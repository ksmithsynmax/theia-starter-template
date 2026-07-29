import numpy as np
from PIL import Image

def landmarks(path, xlo, xhi, wthr, ytrim=0):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.int32)
    H, W, _ = a.shape
    water = a[:, :30, :].reshape(-1, 3).mean(axis=0)
    dist = np.sqrt(((a - water) ** 2).sum(axis=2))
    m = dist > wthr
    m[:, :xlo] = False
    m[:, xhi:] = False
    if ytrim:
        m[:ytrim] = False
        m[H - ytrim:] = False
    col = m.sum(axis=0)
    row = m.sum(axis=1)
    # ship top/bottom: rows with strong coverage
    rows = np.where(row > 0.12 * (xhi - xlo))[0]
    top, bot = rows.min(), rows.max()
    # gap between the two hulls: within the hull rows, the column with least cover
    band = m[top:bot + 1, :]
    colb = band.sum(axis=0)
    cx0 = xlo + np.argmax(colb[xlo:xhi] > 0)          # first shippy col
    cx1 = xhi - np.argmax(colb[xhi:xlo:-1] > 0)       # last shippy col
    mid = (cx0 + cx1) // 2
    gap = mid - 60 + int(np.argmin(colb[mid - 60:mid + 60]))
    print(f'{path.split("/")[-1]} ({W}x{H}) top {top} bot {bot} h {bot-top} '
          f'leftEdge {cx0} rightEdge {cx1} gap {gap}')
    return dict(top=top, bot=bot, l=cx0, r=cx1, gap=gap, W=W, H=H)

A = landmarks('src/assets/sts_raft_2.png', 500, 980, 55)
S = landmarks('.sts_mask/app_shot.png', 320, 620, 60, ytrim=8)

# Solve uniform-ish mapping asset->shot from horizontal (gap, edges) and vertical (top,bot)
sx = (S['r'] - S['l']) / (A['r'] - A['l'])
sy = (S['bot'] - S['top']) / (A['bot'] - A['top'])
ox = S['l'] - A['l'] * sx
oy = S['top'] - A['top'] * sy
print(f'\nasset->shot  sx {sx:.4f}  sy {sy:.4f}  ox {ox:.1f}  oy {oy:.1f}')
print(f'sx/sy ratio {sx/sy:.4f}  (1.0 => uniform/cover; !=1 => image displayed stretched)')
