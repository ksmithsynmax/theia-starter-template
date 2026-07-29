import numpy as np
from PIL import Image

im = Image.open('src/assets/sts_raft_2.png').convert('RGB')
a = np.asarray(im).astype(np.int32)
H, W, _ = a.shape
water = a[:, :40, :].reshape(-1, 3).mean(axis=0)
dist = np.sqrt(((a - water) ** 2).sum(axis=2))
mask = dist > 55

gap_x = 767
for label, x0, x1 in [('LEFT', 539, gap_x), ('RIGHT', gap_x, 939)]:
    sub = mask[:, x0:x1]
    w = x1 - x0
    # rows that are clearly hull (>=35% of ship width covered), excludes wakes
    row_cov = sub.sum(axis=1)
    rows = np.where(row_cov > 0.35 * w)[0]
    by0, by1 = rows.min(), rows.max()
    # columns clearly hull within the hull rows
    band = sub[by0:by1 + 1, :]
    col_cov = band.sum(axis=0)
    cols = np.where(col_cov > 0.35 * (by1 - by0))[0]
    bx0, bx1 = x0 + cols.min(), x0 + cols.max()
    print(f'{label}: x {bx0}-{bx1} (w {bx1-bx0}), y {by0}-{by1} (h {by1-by0}), '
          f'cx {(bx0+bx1)/2:.0f}, cy {(by0+by1)/2:.0f}')
