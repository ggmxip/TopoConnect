import streamlit as st

# Load CSS
def load_css():
    with open("static/styles.css") as f:
        st.markdown(f"<style>{f.read()}</style>", unsafe_allow_html=True)

# Load JavaScript
def load_js():
    with open("static/js/script.js") as f:
        st.markdown(f"<script>{f.read()}</script>", unsafe_allow_html=True)

# Load HTML
def load_html():
    with open("templates/index.html") as f:
        st.markdown(f"{f.read()}", unsafe_allow_html=True)

# Main function
def main():
    load_css()  # Load CSS
    load_js()   # Load JavaScript
    load_html() # Load HTML

if __name__ == '__main__':
    main()