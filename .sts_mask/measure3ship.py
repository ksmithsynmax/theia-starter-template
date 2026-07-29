import numpy as np
from PIL import Image

im = Image.open('src/assets/sts_raft_3.png').convert('RGB')
a = np.asarray(im).astype(np.int32)
H, W, _ = a.shape
print('size', W, H)
water = a[:, :30, :].reshape(-1, 3).mean(axis=0)
dist = np.sqrt(((a - water) ** 2).sum(axis=2))
mask = dist > 55

col = mask.sum(axis=0)
# find shippy x-range
xs = np.where(col > H * 0.02)[0]
print('overall ship x', xs.min(), xs.max())

# find the two gaps (three hulls) by locating local minima in coverage
prof = col.copy().astype(float)
# smooth
k = 15
prof = np.convolve(prof, np.ones(k) / k, mode='same')
lo, hi = xs.min(), xs.max()
seg = prof[lo:hi]
# split into 3 by finding 2 lowest-coverage columns spaced apart
order = np.argsort(seg)
gaps = []
for idx in order:
    x = lo + idx
    if all(abs(x - g) > 120 for g in gaps):
        gaps.append(x)
    if len(gaps) == 2:
        break
gaps.sort()
print('gaps at', gaps)

bounds = [xs.min(), gaps[0], gaps[1], xs.max()]
for i in range(3):
    x0b, x1b = bounds[i], bounds[i + 1]
    sub = mask[:, x0b:x1b]
    w = x1b - x0b
    rows = np.where(sub.sum(axis=1) > 0.30 * w)[0]
    by0, by1 = rows.min(), rows.max()
    band = sub[by0:by1 + 1]
    cols = np.where(band.sum(axis=0) > 0.30 * (by1 - by0))[0]
    bx0, bx1 = x0b + cols.min(), x0b + cols.max()
    print(f'ship{i}: x {bx0}-{bx1} (w {bx1-bx0}) y {by0}-{by1} (h {by1-by0})')
