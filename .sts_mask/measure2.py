import numpy as np
from PIL import Image

im = Image.open('src/assets/sts_raft_2.png').convert('RGB')
a = np.asarray(im).astype(np.int32)
H, W, _ = a.shape

# Water is a fairly uniform dark blue. Sample the far-left column region as water.
water = a[:, :40, :].reshape(-1, 3).mean(axis=0)
print('water rgb ~', water.astype(int))

# Distance from water color -> ship mask
dist = np.sqrt(((a - water) ** 2).sum(axis=2))
mask = dist > 55  # ships differ strongly from water

# Clean up: require columns/rows with enough ship pixels
col_has = mask.sum(axis=0)
row_has = mask.sum(axis=1)

# Combined bbox of everything shippy
ys = np.where(row_has > W * 0.02)[0]
xs = np.where(col_has > H * 0.02)[0]
print('combined bbox x:', xs.min(), xs.max(), 'y:', ys.min(), ys.max())
print('combined width:', xs.max() - xs.min(), 'height:', ys.max() - ys.min())

# Split into two ships by finding the water gap between them (a column band with
# low ship coverage roughly in the middle).
mid = W // 2
band = col_has[mid - 150: mid + 150]
gap_local = np.argmin(band)
gap_x = mid - 150 + gap_local
print('gap x ~', gap_x, 'coverage there:', col_has[gap_x])

for label, x0, x1 in [('LEFT', xs.min(), gap_x), ('RIGHT', gap_x, xs.max())]:
    sub = mask[:, x0:x1]
    cx_cols = np.where(sub.sum(axis=0) > H * 0.02)[0]
    cy_rows = np.where(sub.sum(axis=1) > (x1 - x0) * 0.05)[0]
    bx0, bx1 = x0 + cx_cols.min(), x0 + cx_cols.max()
    by0, by1 = cy_rows.min(), cy_rows.max()
    print(f'{label}: x {bx0}-{bx1} (w {bx1-bx0}), y {by0}-{by1} (h {by1-by0}), '
          f'cx {(bx0+bx1)//2}, cy {(by0+by1)//2}')
