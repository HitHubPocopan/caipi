#!/usr/bin/env python3
filepath = r'c:\Users\54225\Desktop\ProyectoCaipi\app.js'

with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

old = "        const cabin = `Cabaña #${reserva.cabana_id ? reserva.cabana_id.slice(0, 1) : '?'}`;"
new = "        const cabin = `Cabaña #${reserva.cabanas && reserva.cabanas.numero ? reserva.cabanas.numero : '?'}`;"

if old in content:
    content = content.replace(old, new)
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)
    print('Fixed: Cabin number display in notas tab')
else:
    print('Pattern not found in notas section')
