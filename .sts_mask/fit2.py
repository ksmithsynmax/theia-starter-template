import sys, json
import numpy as np
from PIL import Image, ImageDraw
from svgpathtools import parse_path

LEFT = 'M55.5007 779.003H115.501C146.301 722.203 162.667 640.003 167.001 606.003L173.001 156.003C158.601 50.4032 115.001 16.0032 95.0007 12.0032C46.2007 13.6032 20.0007 104.67 13.0007 150.003L3.00073 599.003C4.60073 668.603 38.6674 748.003 55.5007 779.003Z'
RIGHT = 'M239.001 779.003H296.001C330.401 686.203 339.001 622.336 339.001 602.003L334.001 170.003C326.001 42.8032 283.334 5.66984 263.001 3.00317C211.801 3.80317 193.667 114.67 191.001 170.003V592.003C192.601 689.603 223.667 757.336 239.001 779.003Z'

def pbbox(d):
    p = parse_path(d)
    xs, ys = [], []
    for i in range(801):
        z = p.point(i/800)
        xs.append(z.real); ys.append(z.imag)
    return p, min(xs), min(ys), max(xs), max(ys)

# target boxes passed as JSON: [[Lx0,Ly0,Lx1,Ly1],[Rx0,Ry0,Rx1,Ry1]]
targets = json.loads(sys.argv[1])
im = Image.open('src/assets/sts_raft_2.png').convert('RGB')
d = ImageDraw.Draw(im)
for (path_d, color, tb) in [(LEFT,(255,60,60),targets[0]),(RIGHT,(60,255,120),targets[1])]:
    p, x0,y0,x1,y1 = pbbox(path_d)
    tx0,ty0,tx1,ty1 = tb
    sx = (tx1-tx0)/(x1-x0); sy=(ty1-ty0)/(y1-y0)
    ox = tx0 - x0*sx; oy = ty0 - y0*sy
    pts=[]
    for i in range(801):
        z=p.point(i/800)
        pts.append((z.real*sx+ox, z.imag*sy+oy))
    d.line(pts, fill=color, width=4)
    print(color, 'scale', round(sx,4), round(sy,4), 'off', round(ox,1), round(oy,1))
im.save('.sts_mask/overlay_preview.png')
print('saved')
