from flask import Flask, render_template, send_from_directory

app = Flask(__name__, static_folder='static', template_folder='templates')

#Home to Calendar
@app.route('/')
def home():
    return render_template('calendar.html')

#Calendar page
@app.route('/calendar')
def calendar():
    return render_template('calendar.html')

#Day view page
@app.route('/day-view')
def day_view():
    return render_template('day-view.html')

#Lesson creator page
@app.route('/lesson-creator')
def lesson_creator():
    return render_template('lesson-creator.html')

#Lesson library page
@app.route('/lesson-library')
def lesson_library():
    return render_template('lesson-library.html')

#Serve JS files
@app.route('/js/<path:filename>')
def serve_js(filename):
    return send_from_directory('js', filename)

#Serve CSS files
@app.route('/css/<path:filename>')
def serve_css(filename):
    return send_from_directory('css', filename)

if __name__ == '__main__':
    app.run(debug=True)
