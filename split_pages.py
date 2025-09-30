"""
Script to split the old index.html into 5 separate pages
"""

# Read the old HTML file
with open('index-old.html', 'r', encoding='utf-8') as f:
    content = f.read()

# Common navigation HTML
nav_html = '''    <nav>
        <div class="nav-container">
            <a href="index.html">🏠 Home</a>
            <a href="itinerary.html" {itinerary_active}>📅 Itinerary</a>
            <a href="planning.html" {planning_active}>✅ Planning</a>
            <a href="logistics.html" {logistics_active}>🚄 Logistics</a>
            <a href="analysis.html" {analysis_active}>📊 Analysis</a>
            <a href="gpt-comment.html">💬 GPT Review</a>
            <a href="grok-comment.html">💬 Grok Review</a>
        </div>
    </nav>'''

# Extract sections by ID
import re

def extract_section(content, section_id):
    pattern = f'<section id="{section_id}">(.*?)</section>'
    match = re.search(pattern, content, re.DOTALL)
    return match.group(0) if match else ""

def create_page(title, nav_active, sections_html):
    return f'''<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{title} - China Trip 2025</title>
    <link rel="stylesheet" href="styles.css">
</head>
<body>
    <header>
        <h1>🇨🇳 China Trip 2025</h1>
        <p>October 14 - November 5, 2025</p>
    </header>

{nav_active}

    <div class="container">
        <main>
{sections_html}
        </main>
    </div>

    <footer>
        <p>&copy; 2025 China Trip Planning | <a href="index.html">Home</a></p>
    </footer>
</body>
</html>'''

# Planning page sections
planning_sections = [
    'immediate-priorities',
    'driver-maximization',
    'local-transport-strategy',
    'booking-checklist',
    'flight-details',
    'driver-details',
    'booking-details',
    'strategic-decisions',
    'ticket-recommendations'
]

# Logistics page sections
logistics_sections = [
    'transport-analysis'
]

# Analysis page sections
analysis_sections = [
    'crowd-analysis',
    'weather-analysis',
    'time-allocation'
]

print("Extracting sections...")
print(f"Planning sections: {planning_sections}")
print("Creating pages manually due to complexity...")
print("Please run the manual page creation steps in Claude Code")