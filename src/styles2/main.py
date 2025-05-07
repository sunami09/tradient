import os
import random
import subprocess
import argparse
from pathlib import Path
import string

def generate_large_random_css(min_lines=500):
    """Generate a large random CSS file with at least 500 lines"""
    # Define possible CSS properties and values for greater variety
    colors = [f"#{random.randint(0, 0xFFFFFF):06x}" for _ in range(30)]
    font_families = ["Arial", "Helvetica", "sans-serif", "Times New Roman", "Georgia", "serif", 
                     "Courier New", "monospace", "Verdana", "Tahoma", "Trebuchet MS", "Impact",
                     "Comic Sans MS", "Palatino", "Garamond", "Bookman", "Avant Garde", "Roboto",
                     "Open Sans", "Lato", "Montserrat", "Ubuntu", "Merriweather", "Source Sans Pro"]
    font_sizes = [f"{size}{unit}" for size in range(1, 100) for unit in ["px", "em", "rem", "%", "vw", "vh"]]
    margins_paddings = [f"{size}{unit}" for size in range(0, 100) for unit in ["px", "em", "rem", "%", "vw", "vh"]]
    border_styles = ["none", "solid", "dashed", "dotted", "double", "groove", "ridge", "inset", "outset"]
    
    # Advanced selectors
    elements = ["div", "p", "h1", "h2", "h3", "h4", "h5", "h6", "span", "a", "button", "input", 
                "img", "ul", "ol", "li", "table", "tr", "td", "form", "section", "article", 
                "nav", "header", "footer", "main", "aside", "figure", "figcaption", "blockquote"]
    
    pseudo_classes = [":hover", ":active", ":focus", ":visited", ":first-child", ":last-child", 
                      ":nth-child(odd)", ":nth-child(even)", ":nth-child(3n)", ":nth-of-type(2n+1)",
                      ":not(:first-child)", ":empty", ":checked", ":disabled", ":enabled", ":target"]
    
    # Generate class and ID names
    def random_name(length=8):
        return ''.join(random.choice(string.ascii_lowercase) for _ in range(length))
    
    class_names = [random_name() for _ in range(50)]
    id_names = [random_name() for _ in range(30)]
    
    # Generate random media queries
    media_queries = [
        "@media screen and (max-width: 600px)",
        "@media screen and (min-width: 768px)",
        "@media screen and (min-width: 992px)",
        "@media screen and (min-width: 1200px)",
        "@media (orientation: portrait)",
        "@media (orientation: landscape)",
        "@media print",
        "@media (prefers-color-scheme: dark)",
        "@media (prefers-reduced-motion: reduce)",
        "@media screen and (max-width: 600px) and (orientation: landscape)"
    ]
    
    # Advanced properties
    properties = {
        "display": ["block", "inline", "inline-block", "flex", "grid", "none", "table", "contents"],
        "position": ["static", "relative", "absolute", "fixed", "sticky"],
        "flex-direction": ["row", "row-reverse", "column", "column-reverse"],
        "justify-content": ["flex-start", "flex-end", "center", "space-between", "space-around", "space-evenly"],
        "align-items": ["flex-start", "flex-end", "center", "baseline", "stretch"],
        "flex-wrap": ["nowrap", "wrap", "wrap-reverse"],
        "grid-template-columns": ["1fr", "repeat(2, 1fr)", "repeat(3, 1fr)", "repeat(4, 1fr)", "auto 1fr", "minmax(0, 1fr)"],
        "grid-template-rows": ["auto", "1fr", "repeat(3, auto)", "minmax(100px, auto)"],
        "text-align": ["left", "center", "right", "justify"],
        "text-transform": ["none", "uppercase", "lowercase", "capitalize"],
        "font-weight": ["normal", "bold", "100", "200", "300", "400", "500", "600", "700", "800", "900"],
        "text-decoration": ["none", "underline", "overline", "line-through"],
        "box-shadow": [f"{random.randint(0, 20)}px {random.randint(0, 20)}px {random.randint(0, 50)}px {colors[random.randint(0, len(colors)-1)]}" for _ in range(10)],
        "transition": [f"all {random.uniform(0.1, 2.0):.1f}s ease-in-out" for _ in range(5)],
        "transform": [f"rotate({random.randint(-180, 180)}deg)", f"scale({random.uniform(0.5, 2.0):.1f})", "translateX(10px)", "translateY(-20px)", "skew(15deg, 10deg)"],
        "opacity": [f"{random.uniform(0, 1):.1f}" for _ in range(5)],
        "z-index": [str(random.randint(-10, 100)) for _ in range(10)],
        "overflow": ["visible", "hidden", "scroll", "auto"],
        "cursor": ["pointer", "default", "help", "wait", "text", "move", "not-allowed"],
        "background-image": [f"linear-gradient({random.randint(0, 360)}deg, {random.choice(colors)}, {random.choice(colors)})" for _ in range(10)]
    }
    
    # Generate CSS content
    css_content = ""
    line_count = 0
    
    # Add some CSS variables at root
    css_content += ":root {\n"
    for i in range(20):
        css_content += f"    --color-{i}: {random.choice(colors)};\n"
        line_count += 1
    for i in range(10):
        css_content += f"    --spacing-{i}: {random.randint(1, 50)}px;\n"
        line_count += 1
    css_content += "}\n\n"
    line_count += 2
    
    # Add CSS reset section
    css_content += "/* CSS Reset */\n"
    css_content += "* {\n"
    css_content += "    margin: 0;\n"
    css_content += "    padding: 0;\n"
    css_content += "    box-sizing: border-box;\n"
    css_content += "}\n\n"
    line_count += 7
    
    # Generate many selectors and rules until we reach at least 500 lines
    while line_count < min_lines:
        # Decide what type of rule to generate
        rule_type = random.choice(["standard", "complex", "media_query", "keyframes"])
        
        if rule_type == "standard":
            # Generate random selector
            selector_type = random.choice(["element", "class", "id", "compound"])
            
            if selector_type == "element":
                selector = random.choice(elements)
            elif selector_type == "class":
                selector = f".{random.choice(class_names)}"
            elif selector_type == "id":
                selector = f"#{random.choice(id_names)}"
            else:  # compound
                num_parts = random.randint(2, 4)
                parts = []
                for _ in range(num_parts):
                    part_type = random.choice(["element", "class", "id", "pseudo"])
                    if part_type == "element":
                        parts.append(random.choice(elements))
                    elif part_type == "class":
                        parts.append(f".{random.choice(class_names)}")
                    elif part_type == "id":
                        parts.append(f"#{random.choice(id_names)}")
                    else:  # pseudo
                        base = random.choice(elements)
                        parts.append(f"{base}{random.choice(pseudo_classes)}")
                
                # Join parts with different combinators
                combinators = [" ", " > ", " + ", " ~ "]
                selector = ""
                for i, part in enumerate(parts):
                    if i > 0:
                        selector += random.choice(combinators)
                    selector += part
            
            # Add pseudo class if not already included
            if random.random() < 0.3 and "::" not in selector and ":" not in selector:
                selector += random.choice(pseudo_classes)
            
            # Generate properties
            css_content += f"{selector} {{\n"
            line_count += 1
            
            num_properties = random.randint(3, 15)
            added_props = set()
            
            for _ in range(num_properties):
                prop_name = random.choice(list(properties.keys()))
                
                # Skip if already added to avoid duplicates
                if prop_name in added_props:
                    continue
                    
                added_props.add(prop_name)
                prop_value = random.choice(properties[prop_name])
                
                css_content += f"    {prop_name}: {prop_value};\n"
                line_count += 1
                
                # Add some color properties
                if random.random() < 0.3 and "color" not in added_props:
                    css_content += f"    color: {random.choice(colors)};\n"
                    added_props.add("color")
                    line_count += 1
                
                if random.random() < 0.3 and "background-color" not in added_props:
                    css_content += f"    background-color: {random.choice(colors)};\n"
                    added_props.add("background-color")
                    line_count += 1
                
                # Add some font properties
                if random.random() < 0.3 and "font-family" not in added_props:
                    css_content += f"    font-family: {random.choice(font_families)};\n"
                    added_props.add("font-family")
                    line_count += 1
                
                if random.random() < 0.3 and "font-size" not in added_props:
                    css_content += f"    font-size: {random.choice(font_sizes)};\n"
                    added_props.add("font-size")
                    line_count += 1
                
                # Add margin/padding
                if random.random() < 0.3 and "margin" not in added_props:
                    css_content += f"    margin: {random.choice(margins_paddings)};\n"
                    added_props.add("margin")
                    line_count += 1
                
                if random.random() < 0.3 and "padding" not in added_props:
                    css_content += f"    padding: {random.choice(margins_paddings)};\n"
                    added_props.add("padding")
                    line_count += 1
            
            css_content += "}\n\n"
            line_count += 2
            
        elif rule_type == "complex":
            # Multiple selectors sharing the same properties
            num_selectors = random.randint(2, 5)
            selectors = []
            
            for _ in range(num_selectors):
                selector_type = random.choice(["element", "class", "id"])
                
                if selector_type == "element":
                    selectors.append(random.choice(elements))
                elif selector_type == "class":
                    selectors.append(f".{random.choice(class_names)}")
                else:  # id
                    selectors.append(f"#{random.choice(id_names)}")
            
            css_content += f"{', '.join(selectors)} {{\n"
            line_count += 1
            
            num_properties = random.randint(5, 12)
            for _ in range(num_properties):
                prop_name = random.choice(list(properties.keys()))
                prop_value = random.choice(properties[prop_name])
                
                css_content += f"    {prop_name}: {prop_value};\n"
                line_count += 1
            
            css_content += "}\n\n"
            line_count += 2
            
        elif rule_type == "media_query":
            # Media query block
            media = random.choice(media_queries)
            css_content += f"{media} {{\n"
            line_count += 1
            
            # Add 2-4 rules inside the media query
            for _ in range(random.randint(2, 4)):
                if random.random() < 0.5:
                    selector = f".{random.choice(class_names)}"
                else:
                    selector = random.choice(elements)
                
                css_content += f"    {selector} {{\n"
                line_count += 1
                
                num_properties = random.randint(3, 8)
                for _ in range(num_properties):
                    prop_name = random.choice(list(properties.keys()))
                    prop_value = random.choice(properties[prop_name])
                    
                    css_content += f"        {prop_name}: {prop_value};\n"
                    line_count += 1
                
                css_content += "    }\n\n"
                line_count += 2
            
            css_content += "}\n\n"
            line_count += 2
            
        else:  # keyframes
            # Animation keyframes
            animation_name = f"animation-{random_name(6)}"
            css_content += f"@keyframes {animation_name} {{\n"
            line_count += 1
            
            # Add keyframe steps
            steps = [0, 25, 50, 75, 100]
            if random.random() < 0.5:
                steps = [0, 50, 100]  # Simpler animation
            
            for step in steps:
                css_content += f"    {step}% {{\n"
                line_count += 1
                
                num_properties = random.randint(2, 4)
                for _ in range(num_properties):
                    prop_name = random.choice(["transform", "opacity", "color", "background-color"])
                    
                    if prop_name == "transform":
                        prop_value = random.choice(properties["transform"])
                    elif prop_name == "opacity":
                        prop_value = random.choice(properties["opacity"])
                    else:
                        prop_value = random.choice(colors)
                    
                    css_content += f"        {prop_name}: {prop_value};\n"
                    line_count += 1
                
                css_content += "    }\n"
                line_count += 1
            
            css_content += "}\n\n"
            line_count += 2
            
            # Add a class that uses the animation
            css_content += f".animated-{random_name(6)} {{\n"
            css_content += f"    animation: {animation_name} {random.randint(1, 10)}s infinite;\n"
            css_content += "}\n\n"
            line_count += 3
    
    # Add comments throughout the file for better readability
    sections = [
        "/* Header Styles */",
        "/* Main Content Styles */",
        "/* Footer Styles */",
        "/* Navigation Styles */",
        "/* Form Elements */",
        "/* Button Styles */",
        "/* Utility Classes */",
        "/* Responsive Layouts */",
        "/* Animation Effects */",
        "/* Dark Mode Overrides */",
        "/* Print Styles */",
        "/* Accessibility Helpers */"
    ]
    
    # Insert section comments at random positions in the CSS content
    lines = css_content.split('\n')
    for section in sections:
        if len(lines) > 20:  # Only if we have enough lines
            pos = random.randint(10, len(lines) - 10)
            lines.insert(pos, "\n" + section + "\n")
    
    final_css = '\n'.join(lines)
    
    return final_css

def create_unique_filename(base_name="style"):
    """Create a unique CSS filename that doesn't exist yet"""
    i = 1
    while True:
        filename = f"{base_name}_{i}.css"
        if not os.path.exists(filename):
            return filename
        i += 1

def add_and_commit_to_git(filename):
    """Add the file to git and commit it"""
    try:
        # Add the file to git
        subprocess.run(["git", "add", filename], check=True)
        
        # Commit the file with its name as the commit message
        subprocess.run(["git", "commit", "-m", f"Added {filename}"], check=True)
        
        print(f"Added and committed {filename} to git")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Error with git operations for {filename}: {e}")
        return False

def main():
    """Main function to create large random CSS files and commit them to git"""
    parser = argparse.ArgumentParser(description="Generate large random CSS files and commit them to git")
    parser.add_argument("num_files", type=int, help="Number of CSS files to generate")
    parser.add_argument("--prefix", type=str, default="style", help="Prefix for CSS filenames (default: style)")
    parser.add_argument("--min-lines", type=int, default=500, help="Minimum number of lines per CSS file (default: 500)")
    args = parser.parse_args()
    
    # Check if we're in a git repository
    try:
        subprocess.run(["git", "status"], check=True, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
    except subprocess.CalledProcessError:
        print("Error: Current directory is not a git repository. Initialize git first with 'git init'.")
        return
    
    # Create the specified number of files
    for i in range(args.num_files):
        # Generate unique filename
        filename = create_unique_filename(args.prefix)
        
        # Generate large random CSS content
        css_content = generate_large_random_css(args.min_lines)
        
        # Write content to file
        with open(filename, "w") as f:
            f.write(css_content)
        
        print(f"Created file: {filename} with {css_content.count(chr(10)) + 1} lines")
        
        # Add and commit the file to git
        add_and_commit_to_git(filename)
    
    print(f"Successfully created and committed {args.num_files} large CSS files.")

if __name__ == "__main__":
    main()