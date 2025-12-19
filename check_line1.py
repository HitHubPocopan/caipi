with open(r'c:\Users\54225\Desktop\ProyectoCaipi\supabase.js', 'r', encoding='utf-8') as f:
    lines = f.readlines()
    print(f"Total lines: {len(lines)}")
    print(f"Line 1: {repr(lines[0])}")
    print(f"Line 2: {repr(lines[1])}")
    print(f"Line 3: {repr(lines[2])}")
    print(f"Line 4: {repr(lines[3])}")
    
    count_supabase_decl = sum(1 for line in lines if 'let supabase' in line or 'const supabase' in line)
    print(f"\nDeclarations of 'supabase': {count_supabase_decl}")
    
    for i, line in enumerate(lines[:20], 1):
        print(f"{i}: {line.rstrip()}")
