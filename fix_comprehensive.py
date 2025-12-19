import re

filepath = r'c:\Users\54225\Desktop\ProyectoCaipi\supabase.js'
with open(filepath, 'r', encoding='utf-8') as f:
    content = f.read()

content = re.sub(r'\bsupabase\b(?=\.)', 'supabaseClient', content)
content = re.sub(r'await\s+supabase\s*\.', 'await supabaseClient.', content)
content = re.sub(r'let\s+query\s*=\s*supabase', 'let query = supabaseClient', content)
content = re.sub(r'=\s*supabase\s*\.', '= supabaseClient.', content)

with open(filepath, 'w', encoding='utf-8') as f:
    f.write(content)

print('Fixed comprehensively')
