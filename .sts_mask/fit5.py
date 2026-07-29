import sys, json
from PIL import Image, ImageDraw
from svgpathtools import parse_path

P1 = 'M25.7061 632.504L63.7061 634.504C87.3061 604.504 100.873 540.67 104.706 512.503L135.706 121.504C136.506 25.9035 109.04 2.67019 95.2062 3.00352C60.8062 3.00352 42.5395 76.0035 37.7062 112.504L3.70612 505.004C-0.693882 569.004 16.5395 616.67 25.7061 632.504Z'
P2 = 'M148.706 647.003H185.206C205.206 615.803 217.873 555.337 221.706 529.003L236.706 115.003C229.106 51.8034 204.206 30.0034 192.706 27.0034C162.706 28.6034 147.206 83.6701 143.206 111.003L122.706 520.003C119.906 582.403 138.873 630.67 148.706 647.003Z'
P3 = 'M250.706 144.503L230.706 522.503C227.616 580.903 245.419 631.837 254.706 650.003H287.206C307.606 616.403 320.039 558.337 323.706 533.503L343.706 149.003C344.506 65.0034 316.373 41.3368 302.206 40.0034C266.606 40.4034 253.039 109.837 250.706 144.503Z'
P4 = 'M354.206 151.003L327.706 545.503C326.506 606.303 341.54 652.17 349.206 667.503L392.206 669.003C403.006 652.203 421.04 588.337 428.706 558.503L454.706 158.003C455.906 70.4034 425.873 45.5034 410.706 44.0034C377.106 44.8034 359.04 115.67 354.206 151.003Z'
P5 = 'M462.206 198.503L469.706 600.003C476.106 642.803 492.706 675.17 500.206 686.003H539.706C547.306 672.003 558.54 622.837 563.206 600.003L553.206 198.503C546.806 103.703 516.873 80.67 502.706 81.0033C467.906 85.4033 461.206 161.17 462.206 198.503Z'
PATHS = [P1, P2, P3, P4, P5]
COLORS = [(255, 60, 60), (60, 255, 120), (90, 160, 255), (255, 200, 40), (255, 90, 220)]

def pbbox(d):
    p = parse_path(d)
    xs, ys = [], []
    for i in range(801):
        z = p.point(i / 800)
        xs.append(z.real); ys.append(z.imag)
    return p, min(xs), min(ys), max(xs), max(ys)

for i, d in enumerate(PATHS):
    _, x0, y0, x1, y1 = pbbox(d)
    print(f'path{i} trace bbox x {x0:.1f}-{x1:.1f} (w {x1-x0:.1f}) y {y0:.1f}-{y1:.1f} (h {y1-y0:.1f})')

if len(sys.argv) > 1:
    targets = json.loads(sys.argv[1])
    im = Image.open('src/assets/sts_raft_5.png').convert('RGB')
    d = ImageDraw.Draw(im)
    for path_d, color, tb in zip(PATHS, COLORS, targets):
        p, x0, y0, x1, y1 = pbbox(path_d)
        tx0, ty0, tx1, ty1 = tb
        sx = (tx1 - tx0) / (x1 - x0); sy = (ty1 - ty0) / (y1 - y0)
        ox = tx0 - x0 * sx; oy = ty0 - y0 * sy
        pts = []
        for i in range(801):
            z = p.point(i / 800)
            pts.append((z.real * sx + ox, z.imag * sy + oy))
        d.line(pts, fill=color, width=4)
        print(color, 'tx', round(ox, 1), 'ty', round(oy, 1), 'sx', round(sx, 4), 'sy', round(sy, 4),
              'tb', [round(x0, 1), round(y0, 1), round(x1, 1), round(y1, 1)])
    im.save('.sts_mask/overlay5.png')
    print('saved .sts_mask/overlay5.png')
