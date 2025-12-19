with open(r'c:\Users\54225\Desktop\ProyectoCaipi\supabase.js', 'r', encoding='utf-8') as f:
    content = f.read()

content = content.replace('await supabaseClient.', 'await window.mySupabaseClient.')
content = content.replace('let query = supabaseClient', 'let query = window.mySupabaseClient')
content = content.replace(' = supabaseClient.', ' = window.mySupabaseClient.')
content = content.replace('return supabaseClient', 'return window.mySupabaseClient')

with open(r'c:\Users\54225\Desktop\ProyectoCaipi\supabase.js', 'w', encoding='utf-8') as f:
    f.write(content)

print('All supabaseClient references replaced')
