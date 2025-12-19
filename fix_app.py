#!/usr/bin/env python3
filepath = r'c:\Users\54225\Desktop\ProyectoCaipi\app.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('  loadCabanas();\n  setupEventListeners();', '  await loadCabanas();\n  setupEventListeners();')

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed: await added to loadCabanas()')
