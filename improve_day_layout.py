"""
Script to improve the layout of day content in itinerary.html
Adds icons, cards, and better structure
"""

from pathlib import Path
import re

def add_icons_to_content(content):
    """Add emoji icons to common labels"""
    replacements = {
        '<strong>Plan:</strong>': '<strong>📍 Plan:</strong>',
        '<strong>Focus:</strong>': '<strong>🎯 Focus:</strong>',
        '<strong>Sightseeing Rec:</strong>': '<strong>🏛️ Sightseeing:</strong>',
        '<strong>Sightseeing Rec (Evening):</strong>': '<strong>🌆 Evening Sightseeing:</strong>',
        '<strong>Transport:</strong>': '<strong>🚄 Transport:</strong>',
        '<strong>Hotel:</strong>': '<strong>🏨 Hotel:</strong>',
        '<strong>Tip:</strong>': '<strong>💡 Tip:</strong>',
        '<strong>PLAN CHANGE:</strong>': '<strong>⚠️ PLAN CHANGE:</strong>',
        '<strong>ACCOMMODATION:</strong>': '<strong>🏨 Accommodation:</strong>',
    }

    for old, new in replacements.items():
        content = content.replace(old, new)

    return content

def wrap_special_sections(content):
    """Wrap tips and warnings in special boxes"""
    # Wrap tip paragraphs
    content = re.sub(
        r'<p><strong>💡 Tip:</strong>(.*?)</p>',
        r'<div class="tip-box"><strong>💡 Tip:</strong>\1</div>',
        content,
        flags=re.DOTALL
    )

    # Wrap PLAN CHANGE paragraphs
    content = re.sub(
        r'<p><strong>⚠️ PLAN CHANGE:</strong>(.*?)</p>',
        r'<div class="warning-box"><strong>⚠️ PLAN CHANGE:</strong>\1</div>',
        content,
        flags=re.DOTALL
    )

    return content

def improve_list_sections(content):
    """Wrap list sections in cards"""
    # Find sightseeing sections with lists
    content = re.sub(
        r'<p><strong>🏛️ Sightseeing:</strong></p>\s*<ul>',
        r'<div class="day-section"><div class="day-section-title">🏛️ Sightseeing Highlights</div><ul>',
        content
    )

    # Close the div after ul
    content = re.sub(
        r'</ul>(\s*)<p><strong>',
        r'</ul></div>\1<p><strong>',
        content
    )

    return content

def main():
    # Read itinerary HTML
    html_path = Path('itinerary.html')
    html = html_path.read_text(encoding='utf-8')

    # Find all day-content sections
    pattern = r'(<div class="day-content">)(.*?)(</div>\s*</div>)'

    def improve_content(match):
        prefix = match.group(1)
        content = match.group(2)
        suffix = match.group(3)

        # Apply improvements
        content = add_icons_to_content(content)
        content = wrap_special_sections(content)
        content = improve_list_sections(content)

        return prefix + content + suffix

    # Apply improvements
    improved_html = re.sub(pattern, improve_content, html, flags=re.DOTALL)

    # Write back
    html_path.write_text(improved_html, encoding='utf-8')

    print('✅ Improved day content layout with:')
    print('  - Added emoji icons to section headers')
    print('  - Wrapped tips in blue boxes')
    print('  - Wrapped warnings in yellow boxes')
    print('  - Improved list formatting')
    print(f'  - Updated {improved_html.count("day-content")} days')

if __name__ == '__main__':
    main()