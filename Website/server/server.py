from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename
import os
import util

app = Flask(__name__)
CORS(app)
app.config['UPLOAD_FOLDER'] = 'UPLOAD_FOLDER'

@app.route('/get_category')
def get_category():
    response = jsonify({
        'categories': util.get_category()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/get_state')
def get_state():
    response = jsonify({
        'states': util.get_state()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/get_city_population',methods=['GET','POST'])
def get_city_population():
    city = request.json['city']
    response = jsonify({
        'population': util.get_city_population(city)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/check_cc_validity',methods=['GET','POST'])
def check_cc_validity():
    name = request.json['ccName']
    cc_number = request.json['ccNo']
    cvv = request.json['ccCVV']
    exp_month = request.json['ccMonth']
    exp_year = request.json['ccYear']

    response = jsonify({
        'isValid': util.check_cc_validity(name, cc_number, cvv, exp_month, exp_year)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/saveTransaction',methods=['GET','POST'])
def saveTransaction():
    name = request.json['name']
    email = request.json['email']
    address = request.json['address']
    amount = request.json['amount']
    gender = request.json['gender']
    city_pop = request.json['city_pop']
    category = request.json['category']
    state = request.json['state']
    cc_type = request.json['cc_type']
    day = request.json['day']
    time_period = request.json['time_period']
    response = jsonify({
        'response': util.saveTransaction(name, email, address, amount, gender, city_pop, category, state, cc_type, day, time_period)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/checkTransaction',methods=['GET','POST'])
def checkTransaction():
    amount = request.json['amount']
    gender = request.json['gender']
    city_pop = request.json['city_pop']
    category = request.json['category']
    state = request.json['state']
    cc_type = request.json['cc_type']
    day = request.json['day']
    time_period = request.json['time_period']
    response = jsonify({
        'response': util.checkTransaction(amount, gender, city_pop, category, state, cc_type, day, time_period)
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/uploadFile',methods=['GET','POST'])
def uploadFile():
    # Check if a file was uploaded in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})
    file = request.files['file']

    # Check if the file has a name and allowed file extension
    if file.filename == '':
        return jsonify({'error': 'No file selected'})
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Invalid file extension'})

    # Save the file to a secure location
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    # Return the results as a JSON object
    return jsonify({
        'response': util.uploadFile(filepath)
    })

@app.route('/formatFile',methods=['GET','POST'])
def formatFile():
    # Check if a file was uploaded in the request
    if 'file' not in request.files:
        return jsonify({'error': 'No file uploaded'})
    file = request.files['file']

    # Check if the file has a name and allowed file extension
    if file.filename == '':
        return jsonify({'error': 'No file selected'})
    if not file.filename.endswith('.csv'):
        return jsonify({'error': 'Invalid file extension'})

    # Save the file to a secure location
    filename = secure_filename(file.filename)
    filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
    file.save(filepath)

    # Return the results as a JSON object
    return jsonify({
        'response': util.formatFile(filepath)
    })


@app.route('/legit',methods=['GET','POST'])
def getLegit():
    response = jsonify({
        'response': util.getLegit()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

@app.route('/fraud',methods=['GET','POST'])
def getFraud():
    response = jsonify({
        'response': util.getFraud()
    })
    response.headers.add('Access-Control-Allow-Origin', '*')
    return response

if __name__ == "__main__":
    print("Starting server for CCFD....")
    app.run()