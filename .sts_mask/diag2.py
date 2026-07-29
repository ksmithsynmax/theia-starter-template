import numpy as np
from PIL import Image

def ship_bbox(path, x_lo, x_hi, wthr, name):
    im = Image.open(path).convert('RGB')
    a = np.asarray(im).astype(np.int32)
    H, W, _ = a.shape
    water = a[:, :30, :].reshape(-1, 3).mean(axis=0)
    dist = np.sqrt(((a - water) ** 2).sum(axis=2))
    m = dist > wthr
    m[:, :x_lo] = False
    m[:, x_hi:] = False
    col = m.sum(axis=0); row = m.sum(axis=1)
    xs = np.where(col > 0.15 * H)[0]
    ys = np.where(row > 0.10 * (x_hi - x_lo))[0]
    print(f'{name} ({W}x{H}) ship x {xs.min()}-{xs.max()} (w {xs.max()-xs.min()}) '
          f'y {ys.min()}-{ys.max()} (h {ys.max()-ys.min()}) aspect '
          f'{(xs.max()-xs.min())/(ys.max()-ys.min()):.3f}')

# Asset: both ships combined
ship_bbox('src/assets/sts_raft_2.png', 500, 980, 55, 'ASSET')
# Screenshot: central band (avoid pill/text)
ship_bbox('.sts_mask/app_shot.png', 320, 620, 60, 'SHOT ')
