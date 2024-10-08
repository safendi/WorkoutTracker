from flask import Flask, render_template, request, redirect, session
from flask_cors import CORS
import sqlite3
import json
import os
import openai
from openai import OpenAI


#AI API STUFF
openAIKey = os.getenv('OPENAI_API_KEY')
client = OpenAI(api_key=openAIKey)


#FLASK SERVERSIDE
app = Flask(__name__)
CORS(app)
app.secret_key = "sheffg"

#app.permanent_session_lifetime = True


#Database setup
conn = sqlite3.connect("users.db", check_same_thread=False)
cursor = conn.cursor()
cursor.execute("""CREATE TABLE IF NOT EXISTS users (
                    username text PRIMARY KEY,
                    password text)""")

cursor.execute("""CREATE TABLE IF NOT EXISTS workouts (
                    username text PRIMARY KEY,
                    workouts text)""")


#Rest API
@app.route('/', methods=['GET', 'POST'])
def login():
    if request.method == 'POST':
        username = request.form['username'].lower()
        password = request.form['password']
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        keypass = cursor.fetchone()
        if keypass is not None:
            print(keypass)
            correctPass = keypass[1]
            if password == correctPass:
                session['usr'] = username
                return redirect("/home")
            else:
                print("wrong password")
                return redirect("/")
        else:
            print("User not found")
            return redirect("/")

    else:
        if 'usr' in session:
            return redirect("/home")
        else :
            return render_template('index.html')





@app.route('/register', methods=['GET', 'POST'])
def register():
    if request.method == 'POST':
        username = request.form['username'].lower()
        password = request.form['password']
        confirmPassword = request.form['confirmPassword']
        cursor.execute("SELECT * FROM users WHERE username = ?", (username,))
        keypass = cursor.fetchone()
        if keypass is None and password == confirmPassword and len(password) >= 3:
            cursor.execute("INSERT INTO users VALUES (?, ?)", (username, password))
            conn.commit()
            session['usr'] = username
            return redirect("/home")
        else:
            print("User already exists or failed to confirm password")
            return redirect("/register")

    else:
        return render_template('register.html')




@app.route('/home')
def home():
    if 'usr' in session:
        return render_template('home.html', usr=session['usr'])
    else :
        return redirect('/')


@app.route('/logout')
def logout():
    session.pop('usr', None)
    return redirect("/")



@app.route('/list', methods=['GET', 'POST'])
def data():
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        for key in data:
            dataKey = key
            data = data[dataKey]
        print(data)
        cursor.execute("SELECT * FROM workouts WHERE username = ?", (session['usr'],))
        list = cursor.fetchone()
        if (list is None):
            newList = {}
            newList[dataKey] = data
            newList = json.dumps(newList)
            cursor.execute("INSERT INTO workouts VALUES (?, ?)", (session['usr'], newList))
            conn.commit()
        else:
            list = list[1]
            list = json.loads(list)
            list[dataKey] = data
            list = json.dumps(list)
            cursor.execute("REPLACE INTO workouts VALUES (?, ?)", (session['usr'], list))
            conn.commit()
        list = cursor.execute("SELECT * FROM workouts WHERE username = ?", (session['usr'],))
        result = list.fetchone()
        print(result[1])
        return result[1]

    elif request.method == 'GET':
        list = cursor.execute("SELECT * FROM workouts WHERE username = ?", (session['usr'],))
        result = list.fetchone()
        if result == None:
            return "None"
        else:
            result = result[1]
            data = json.loads(result)
            return json.dumps(data)


@app.route('/removeWo', methods=['POST'])
def removeWo():
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        get = cursor.execute("SELECT * FROM workouts WHERE username = ?", (session['usr'],))
        list = get.fetchone()
        list = json.loads(list[1])
        print(list)
        list.pop(data)
        print(list)
        list = json.dumps(list)
        cursor.execute("REPLACE INTO workouts VALUES (?, ?)", (session['usr'], list,))
        conn.commit()
        return list


@app.route('/workoutSelected', methods=['POST', 'GET'])
def workoutSelected():
    if request.method == 'POST':
        data = request.get_json()
        session['currentWorkout'] = data
        print(session['currentWorkout'])
        return session['currentWorkout']
    if request.method == 'GET':
        if 'currentWorkout' in session:
            currentWorkout = session['currentWorkout']
            get = cursor.execute("SELECT * FROM workouts WHERE username = ?", (session['usr'],))
            list = get.fetchone()
            list = json.loads(list[1])
            data = list[currentWorkout]
            retData = {}
            retData[currentWorkout] = data
            return json.dumps(retData)
        else:
            return "None"



@app.route('/workout')
def workout():
    return render_template('workout.html')

@app.route('/aiChatBot', methods=['POST'])
def aiChatBot():
    if request.method == 'POST':
        data = request.get_json()
        print(data)
        completion = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a helpful fitness / gym-related assistant named OckBot.  Do not answer non-fitness related questions.  Speak in a brooklyn gangster way. Occasionally, refer to the user as 'my heart' or 'muddy'."},
                {
                    "role": "user",
                    "content": data
                }
            ],
            max_tokens=300
        )

        retVal = completion.choices[0].message.content
        return json.dumps(retVal)


if __name__ == '__main__':
    app.run()
