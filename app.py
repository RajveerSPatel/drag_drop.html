from flask import Flask, send_from_directory

app = Flask(__name__)

# serve the calendar page as the home page
@app.route('/')
def home():
    return send_from_directory('.', 'calendar.html')

# serve all the HTML pages
@app.route('/<path:filename>')
def serve_file(filename):
    return send_from_directory('.', filename)

if __name__ == '__main__':
    app.run(debug=True, port=5000)