import numpy as np
from PIL import Image

im = Image.open('.sts_mask/shot3.png').convert('RGB')
a = np.asarray(im).astype(np.int32)
H, W, _ = a.shape
water = a[:, :12, :].reshape(-1, 3).mean(axis=0)
print('shot', W, H, 'water', water.astype(int))
dist = np.sqrt(((a - water) ** 2).sum(axis=2))

mn = a.min(axis=2); mx = a.max(axis=2)
whiteish = (mn > 120) & ((mx - mn) < 55)   # bright, low-sat -> outline stroke / foam

# For a set of sample rows, print: ship left/right edge (dist>50) and
# outline left/right edge (whiteish) so we can see the gap in the water.
for y in [120, 200, 280, 360, 430]:
    ship_cols = np.where(dist[y] > 55)[0]
    w_cols = np.where(whiteish[y])[0]
    sL = ship_cols.min() if ship_cols.size else -1
    sR = ship_cols.max() if ship_cols.size else -1
    wL = w_cols.min() if w_cols.size else -1
    wR = w_cols.max() if w_cols.size else -1
    print(f'y={y}: shipL={sL} shipR={sR} | outlineL={wL} outlineR={wR} '
          f'| leftGap={sL-wL} rightGap={wR-sR}')
