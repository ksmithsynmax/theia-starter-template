import numpy as np
from PIL import Image

im = Image.open('.sts_mask/app_shot.png').convert('RGB')
a = np.asarray(im).astype(np.int32)
H, W, _ = a.shape
print('shot', W, H)

r, g, b = a[:, :, 0], a[:, :, 1], a[:, :, 2]
# White-ish outline stroke: high brightness, low saturation
mx = a.max(axis=2); mn = a.min(axis=2)
white = (mn > 150) & ((mx - mn) < 40)
ys, xs = np.where(white)
# restrict to hero region (exclude the blue SEGMENT FOCUS pill top-left)
keep = xs > 300
ys, xs = ys[keep], xs[keep]
print('WHITE outline bbox: x', xs.min(), xs.max(), 'y', ys.min(), ys.max())

# Water is dark blue; ships are lighter/warmer. Sample water top-right corner.
water = a[20:60, W-80:W-20, :].reshape(-1, 3).mean(axis=0)
print('water rgb', water.astype(int))
dist = np.sqrt(((a - water) ** 2).sum(axis=2))
ship = dist > 60
# limit to central band to avoid pill/text
ship[:, :300] = False
ship[:, 620:] = False
ys2, xs2 = np.where(ship)
print('SHIP bbox: x', xs2.min(), xs2.max(), 'y', ys2.min(), ys2.max())
