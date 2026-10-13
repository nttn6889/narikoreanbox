import sys, os
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen
F=os.path.dirname(os.path.abspath(__file__))+'/fonts/'
OUT=sys.argv[1]
fonts={w:[TTFont(F+f'{w}la.woff2'),TTFont(F+f'{w}vi.woff2')] for w in (600,800)}
def text_path(s,w,size,x,y,anchor='start',track=0):
    fl=fonts[w]; upm=fl[0]['head'].unitsPerEm; sc=size/upm
    glyphs=[]; adv=0
    for ch in s:
        for f in fl:
            g=f.getBestCmap().get(ord(ch))
            if g: break
        else: raise SystemExit('missing '+ch)
        gs=f.getGlyphSet(); a=f['hmtx'][g][0]
        glyphs.append((gs,g,adv)); adv+=a+track/sc
    adv-=track/sc
    width=adv*sc
    x0={'start':x,'middle':x-width/2,'end':x-width}[anchor]
    pen=SVGPathPen(None); d=[]
    for gs,g,a in glyphs:
        p=SVGPathPen(gs)
        gs[g].draw(TransformPen(p,(sc,0,0,-sc,x0+a*sc,y)))
        d.append(p.getCommands())
    return ' '.join(d), width

P='#53468F'; G='#D4A843'; GT='#C99A2E'; R='#E0313F'; INK='#3A3350'
def tower(tw,win,tip):
    return (f'<rect x="98.6" y="20" width="2.8" height="25" rx="1.4" fill="{tip}"/>'
     f'<g fill="{tw}"><rect x="93" y="44" width="14" height="4.5" rx="2.2"/><rect x="90" y="50.5" width="20" height="4.5" rx="2.2"/>'
     f'<rect x="83" y="57" width="34" height="21" rx="7"/></g>'
     f'<rect x="86.5" y="63" width="27" height="8" rx="1.5" fill="{win}"/>'
     f'<g fill="{tw}"><rect x="91" y="63" width="2" height="8"/><rect x="96" y="63" width="2" height="8"/><rect x="101" y="63" width="2" height="8"/><rect x="106" y="63" width="2" height="8"/>'
     f'<rect x="89" y="79.5" width="22" height="4.5" rx="2.2"/><rect x="95" y="84" width="10" height="34"/>'
     f'<rect x="91.5" y="113" width="17" height="4" rx="2"/><polygon points="95,118 105,118 100,129"/></g>')
def book(l,r,line):
    return (f'<path d="M99 133 C86 125 67 122 48 126 L53 148 C70 144 86 145 99 152 Z" fill="{l}"/>'
     f'<path d="M101 133 C114 125 133 122 152 126 L147 148 C130 144 114 145 101 152 Z" fill="{r}"/>'
     f'<path d="M50 156 C70 150 88 152 100 159 C112 152 130 150 150 156" fill="none" stroke="{line}" stroke-width="5" stroke-linecap="round"/>')
def mark(): return tower(P,'#FFFFFF',R)+book(P,G,P)
MX0,MY0,MW,MH=47.5,20,105,141.5
def place(x,y,sc): return f'<g transform="translate({x-MX0*sc:.2f},{y-MY0*sc:.2f}) scale({sc})">{mark()}</g>'
def wordmark(base,size,x=None,cx=None):
    _,wa=text_path('Nari ',800,size,0,0); _,wb=text_path('TOPIK',800,size,0,0); tot=wa+wb
    x0=cx-tot/2 if cx is not None else x
    a,_=text_path('Nari ',800,size,x0,base); b,_=text_path('TOPIK',800,size,x0+wa,base)
    return f'<path d="{a}" fill="{P}"/><path d="{b}" fill="{GT}"/>', tot
SLO='Hiểu từng câu – Vững từng cấp'
def svg(w,h,body,bg=None):
    b=f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ''
    return f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{b}{body}</svg>'
files={}
files['nari-topik-bieu-tuong']=svg(200,200,place(100-MW*1.24/2,100-MH*1.24/2,1.24))
files['nari-topik-icon']=svg(512,512,f'<circle cx="256" cy="256" r="256" fill="#EFEAF8"/>'+place(256-MW*2.4/2,256-MH*2.4/2+4,2.4))
sc=1.5; wm,tw=wordmark(312,64,cx=200)
files['nari-topik-logo']=svg(400,336,place(200-MW*sc/2,14,sc)+wm)
sl,_=text_path(SLO,600,21.5,200,354,'middle')
files['nari-topik-logo-slogan']=svg(400,374,place(200-MW*sc/2,14,sc)+wm+f'<path d="{sl}" fill="{INK}"/>')
sc2=1.25; mx=20; tx=mx+MW*sc2+30
wm2,tw2=wordmark(98,66,x=tx); sl2,ws2=text_path(SLO,600,25.5,tx+2,142)
W=int(tx+max(tw2,ws2)+22)
files['nari-topik-ngang']=svg(W,200,place(mx,(200-MH*sc2)/2,sc2)+wm2+f'<path d="{sl2}" fill="{INK}"/>')
for k,v in files.items():
    open(f'{OUT}/{k}.svg','w').write(v)
print('ok')
