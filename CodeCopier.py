import os

def list_directory_contents():
    current_dir = os.path.dirname(os.path.realpath(__file__))
    script_name = os.path.basename(__file__)
    output_file_name = "writtencode.txt" #change file name here
    output_file_path = os.path.join(current_dir, output_file_name)

    #Gather all files including subdir
    items = []
    for entry in os.listdir(current_dir):
        full_path = os.path.join(current_dir, entry)

        #Skip THIS file and the previous outputfile
        if os.path.isfile(full_path) and (entry == script_name or entry == output_file_name):
            continue
        
        if os.path.isfile(full_path):
            items.append({
                "name": entry,
                "path": full_path,
                "is_dir": False
            })
        elif os.path.isdir(full_path):
            items.append({
                "name": entry,
                "path": full_path,
                "is_dir": True
            })

    # Sort items alphabetically
    items.sort(key=lambda x: x["name"].lower())

    print(f"\nContents of directory: '{current_dir}'\n")
    if not items:
        print("No files or subdirectories found.")
        return

    # Print out the list with indices
    print("Items Found:")
    for i, item in enumerate(items, start=1):
        item_type = "DIR" if item["is_dir"] else "FILE"
        print(f"{i}. [{item_type}] {item['name']}")
    print("0. All items")

    choice_str = input("\nEnter your choice ('0' for all, '1 2' for 1 and 2, '1to3' for 1->3, '1to3 5' 1->3 and 5): ").strip()

    selected_indices = parse_selection_indices(choice_str, len(items))
    if not selected_indices:
        print("Incorrect selection, Please try again.")
        return #incorrect selection

    final_files = [] #final files that will be exported
    for idx in selected_indices:
        item = items[idx - 1]  #convert idx to list
        if item["is_dir"]:
            dir_files = gather_files_in_directory(item["path"], output_file_name)
            final_files.extend(dir_files)
        else:
            final_files.append(item["path"])

    # remove duplications
    final_files = list(dict.fromkeys(final_files))

    # Prepare lines for output
    output_lines = []
    image_extensions = {".png", ".jpg", ".jpeg", ".gif", ".bmp", ".tiff", ".webp", ".ico", ".ttf", ".pdf"} #switch from image blocker to just these blocker because why not
    #and guess what, im not updating the function name, and theres nothing u can do about, go tell someone, they wont believe u. who they gonna believe. theyll be like no way nabeel would never do that
    #yes, yes i would. now go shoo
    for file_path in final_files:
        dir_name, file_name = os.path.split(file_path)
        _, ext = os.path.splitext(file_name.lower())

        # Get the file path relative to the current directory, so subdirectories are shown
        rel_path = os.path.relpath(file_path, current_dir)

        if ext in image_extensions:
            output_lines.append(f"{rel_path}:\nPLACEHOLDER")
            output_lines.append("\n---\n") #image placeholder
        else:
            try:
                with open(file_path, 'r', errors='ignore') as f:
                    content = f.read()
                output_lines.append(f"{rel_path}:\n{content.strip()}")
                output_lines.append("\n---\n")
            except Exception as e:
                print(f"Error reading '{file_name}': {e}")

    # Write list to output file
    try:
        with open(output_file_path, 'w', errors='ignore') as out_file:
            out_file.write("\n".join(output_lines))
        print(f"\nFile contents exported to '{output_file_path}'.")
    except Exception as e:
        print(f"Error writing output file: {e}")

def parse_selection_indices(choice_str, total_items):

   # This pparses the user's choice string (ex. '0', '1to3', '1 4', '1to3 5') and returns a set of valid 1 based indices/int.
    if not choice_str:
        return set()

    # 0=all items
    if choice_str == "0":
        return set(range(1, total_items + 1))

    chosen_indices = set()
    parts = choice_str.split()
    for part in parts:
        if "to" in part:
            try:
                start, end = map(int, part.split("to"))
                for idx in range(start, end + 1):
                    if 1 <= idx <= total_items:
                        chosen_indices.add(idx)
            except (ValueError, IndexError):
                pass
        else:
            try:
                index = int(part)
                # Validate index range
                if 1 <= index <= total_items:
                    chosen_indices.add(index)
            except (ValueError, IndexError):
                pass

    return chosen_indices

def gather_files_in_directory(dir_path, output_file_name):

    # Recursively gathers all file paths from the given directory, skipping the output file name if encountered.
    file_list = []
    for root, dirs, files in os.walk(dir_path):
        for file_name in files:
            if file_name == output_file_name:
                continue  # Skip output file
            file_path = os.path.join(root, file_name)
            file_list.append(file_path)
    return file_list

if __name__ == "__main__":
    list_directory_contents()
