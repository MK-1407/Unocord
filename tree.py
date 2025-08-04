import os

# Folders to exclude
EXCLUDE_DIRS = {'node_modules', 'dist', '__pycache__'}

def print_tree(start_path, prefix=""):
    try:
        items = sorted(os.listdir(start_path))
    except PermissionError:
        return

    for index, name in enumerate(items):
        path = os.path.join(start_path, name)
        connector = "└── " if index == len(items) - 1 else "├── "

        if os.path.isdir(path):
            if name in EXCLUDE_DIRS:
                continue
            print(prefix + connector + name)
            new_prefix = prefix + ("    " if index == len(items) - 1 else "│   ")
            print_tree(path, new_prefix)
        else:
            print(prefix + connector + name)

if __name__ == "__main__":
    root_dir = "."  # Change to your desired directory
    print(f"Tree structure for: {os.path.abspath(root_dir)}")
    print_tree(root_dir)
