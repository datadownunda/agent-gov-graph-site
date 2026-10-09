"""Dependency-free static release check. Run: python3 scripts/validate.py."""
from html.parser import HTMLParser
from pathlib import Path
from urllib.parse import urlsplit
ROOT = Path(__file__).resolve().parents[1]
class Page(HTMLParser):
    def __init__(self, path):
        super().__init__(); self.ids=set(); self.links=[]; self.h1=0
        self.feed(path.read_text())
    def handle_starttag(self, tag, attrs):
        attrs=dict(attrs)
        if 'id' in attrs:
            assert attrs['id'] not in self.ids, f'Duplicate id: {attrs["id"]}'
            self.ids.add(attrs['id'])
        if tag=='h1': self.h1+=1
        for key in ('href','src'):
            if key in attrs: self.links.append(attrs[key])
pages={p.name:Page(p) for p in ROOT.glob('*.html')}
for name,page in pages.items():
    assert page.h1==1, f'{name}: expected one h1'
    for link in page.links:
        url=urlsplit(link)
        if url.scheme:
            assert url.scheme=='https', f'Unexpected external scheme: {link}'
            continue
        target=url.path or name
        assert (ROOT/target).is_file(), f'Missing file: {target}'
        if url.fragment: assert url.fragment in pages[target].ids, f'Missing anchor: {link}'
assert 'Live positive control-effectiveness attestation has not been demonstrated.' in (ROOT/'index.html').read_text()
assert 'https://github.com/datadownunda/agent-gov-graph' in pages['index.html'].links
print(f'PASS: {len(pages)} pages; local links, fragments, unique IDs, headings and claim boundary.')
