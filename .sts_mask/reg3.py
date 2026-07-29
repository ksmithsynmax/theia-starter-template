import numpy as np
from PIL import Image, ImageDraw
from svgpathtools import parse_path

def lm(path, xlo, xhi, wthr, ytrim=0):
    a = np.asarray(Image.open(path).convert('RGB')).astype(np.int32)
    H, W, _ = a.shape
    water = a[:, :12, :].reshape(-1, 3).mean(axis=0)
    d = np.sqrt(((a - water) ** 2).sum(axis=2))
    m = d > wthr
    m[:, :xlo] = False; m[:, xhi:] = False
    if ytrim:
        m[:ytrim] = False; m[H-ytrim:] = False
    row = m.sum(axis=1); col = m.sum(axis=0)
    rows = np.where(row > 0.12*(xhi-xlo))[0]
    top, bot = rows.min(), rows.max()
    band = m[top:bot+1]
    colb = band.sum(axis=0)
    shippy = np.where(colb > 0.08*(bot-top))[0]
    l, r = shippy.min(), shippy.max()
    return dict(top=top, bot=bot, l=l, r=r, W=W, H=H)

A = lm('src/assets/sts_raft_2.png', 500, 980, 55)
S = lm('.sts_mask/shot3.png', 20, 395, 55, ytrim=6)
print('ASSET', A)
print('SHOT3', S)
sx = (S['r']-S['l'])/(A['r']-A['l'])
sy = (S['bot']-S['top'])/(A['bot']-A['top'])
ox = S['l']-A['l']*sx; oy = S['top']-A['top']*sy
print(f'sx {sx:.4f} sy {sy:.4f} ox {ox:.1f} oy {oy:.1f} ratio {sx/sy:.4f}')

# Draw OLD (1.22/1.09) and NEW (1.09/1.01) predicted outlines onto shot3
LEFT='M55.5007 779.003H115.501C146.301 722.203 162.667 640.003 167.001 606.003L173.001 156.003C158.601 50.4032 115.001 16.0032 95.0007 12.0032C46.2007 13.6032 20.0007 104.67 13.0007 150.003L3.00073 599.003C4.60073 668.603 38.6674 748.003 55.5007 779.003Z'
RIGHT='M239.001 779.003H296.001C330.401 686.203 339.001 622.336 339.001 602.003L334.001 170.003C326.001 42.8032 283.334 5.66984 263.001 3.00317C211.801 3.80317 193.667 114.67 191.001 170.003V592.003C192.601 689.603 223.667 757.336 239.001 779.003Z'
OLD=[(LEFT,(549.3,123.4,1.2239,1.0482)),(RIGHT,(565.2,128.8,1.0878,1.0516))]
NEW=[(LEFT,(567.7,139.8,1.0944,1.0143)),(RIGHT,(585.4,146.9,1.0135,1.0181))]

def draw(hulls, color, out):
    im = Image.open('.sts_mask/shot3.png').convert('RGB')
    dr = ImageDraw.Draw(im)
    for pth,(o1,o2,s1,s2) in hulls:
        p=parse_path(pth); pts=[]
        for i in range(801):
            z=p.point(i/800)
            ax=o1+s1*z.real; ay=o2+s2*z.imag
            pts.append((ax*sx+ox, ay*sy+oy))
        dr.line(pts, fill=color, width=2)
    im.save(out); print('saved', out)

draw(OLD,(255,60,60),'.sts_mask/shot3_old.png')
draw(NEW,(60,255,120),'.sts_mask/shot3_new.png')
