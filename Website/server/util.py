import base64
import json
import pickle
import numpy as np
import geocoder
import datetime
import re
import stripe
import requests
import firebase_admin
from firebase_admin import credentials, db
import pandas as pd

cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred, {"databaseURL": 'DB_URL'})
transactions_ref = db.reference('transactions')

__data_columns = None
__model = None

stripe.api_key = 'API_KEY'
__category = ['entertainment', 'food_dining', 'gas_transport', 'grocery_net', 'grocery_pos', 'health_fitness', 'home',
              'kids_pets', 'misc_net', 'misc_pos', 'personal_care', 'shopping_net', 'shopping_pos', 'travel']
__state = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL', 'IN', 'KS', 'KY',
           'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE', 'NH', 'NJ', 'NM', 'NV', 'NY', 'OH',
           'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT', 'VA', 'VT', 'WA', 'WI', 'WV', 'WY']


def check_cc_validity(name, cc_number, cvv, exp_month, exp_year):
    try:
        token = stripe.Token.create(
            card={
                'number': cc_number,
                'exp_month': exp_month,
                'exp_year': exp_year,
                'cvc': cvv,
                'name': name
            },
        )
        return True
    except stripe.error.CardError as e:
        # Card was declined
        return False
    except stripe.error.RateLimitError as e:
        # Too many requests made to the API too quickly
        return False
    except stripe.error.InvalidRequestError as e:
        # Invalid parameters were supplied to Stripe's API
        return False
    except stripe.error.AuthenticationError as e:
        # Authentication with Stripe's API failed
        # (maybe you changed API keys recently)
        return False
    except stripe.error.APIConnectionError as e:
        # Network communication with Stripe failed
        return False
    except stripe.error.StripeError as e:
        # Something else happened, unrelated to Stripe
        return False


def get_category():
    return __category


def get_state():
    return __state


def get_city_population(city):
    # g = geocoder.ip('me')
    url = 'https://api.api-ninjas.com/v1/city?name={}'.format(city)
    response = requests.get(url, headers={'X-Api-Key': 'API_KEY'})
    if response.status_code == requests.codes.ok:
        data = response.json()
        if isinstance(data, list):
            # if data is a list, assume it contains one dictionary
            data = data[0]
        return data["population"]
    else:
        print("Error:", response.status_code, response.text)


def predict_transaction(amnt, gender, city_pop, category, state, cc_type, day, time_period):
    try:
        category_index = __data_columns.index('category_' + category)
        state_index = __data_columns.index('state_' + state)
        cc_type_index = __data_columns.index('cc_type_' + cc_type)
        day_index = __data_columns.index('day_' + day)
        time_period_index = __data_columns.index('time_period_' + time_period)
    except:
        category_index = -1
        state_index = -1
        cc_type_index = -1
        day_index = -1
        time_period_index = -1

    x = np.zeros(len(__data_columns))
    x[0] = amnt
    x[1] = gender
    x[2] = city_pop

    x[category_index] = 1
    x[state_index] = 1
    x[cc_type_index] = 1
    x[day_index] = 1
    x[time_period_index] = 1

    return __model.predict([x])[0]


def load_saved_artifacts():
    print("Start loading saved artifacts...")
    global __data_columns
    global __model
    with open("./artifacts/columns.json", 'r') as f:
        __data_columns = json.load(f)['data_columns']

    with open("./artifacts/ccfd.pickle", 'rb') as f:
        __model = pickle.load(f)
    print("Finished loading saved artifacts...")
    print(len(__data_columns))


def saveTransaction(name, email, address, amount, gender, city_pop, category, state, cc_type, day, time_period):
    load_saved_artifacts()
    if gender == 'M':
        isMale = 1
    elif gender == 'F':
        isMale = 0

    isFraud = predict_transaction(amount, isMale, city_pop, category, state, cc_type, day, time_period)
    # Define a new transaction object
    new_transaction = {
        "name": name,
        "email": email,
        "address": address,
        "amount": amount,
        "gender": gender,
        "city_pop": city_pop,
        "category": category,
        "state": state,
        "cc_type": cc_type,
        "day": day,
        "time_period": time_period,
        "isFraud": int(isFraud),
        "datetime": datetime.datetime.now().isoformat()
    }
    transactions_ref.push(new_transaction)
    return "Transaction Successful!"


def checkTransaction(amount, gender, city_pop, category, state, cc_type, day, time_period):
    load_saved_artifacts()
    if gender == 'M':
        isMale = 1
    elif gender == 'F':
        isMale = 0

    isFraud = predict_transaction(amount, isMale, city_pop, category, state, cc_type, day, time_period)

    if isFraud == 0:
        return "Legit Transaction"
    elif isFraud == 1:
        return "Fraudulent Transaction"


def uploadFile(input_file):
    load_saved_artifacts()
    # Load input CSV file
    input_df = pd.read_csv(input_file)

    # Apply CCFD model to input data and save results to output CSV file
    input_df['is_fraud'] = __model.predict(input_df)

    # split the input DataFrame into fraud and legit DataFrames
    fraud_df = input_df[input_df['is_fraud'] == 1]
    legit_df = input_df[input_df['is_fraud'] == 0]

    # Save output files
    output_files = {}
    with open('output.csv', 'w') as f:
        f.write(input_df.to_csv(index=False))
    output_files['output'] = base64.b64encode(open('output.csv', 'rb').read()).decode('utf-8')
    with open('fraud.csv', 'w') as f:
        f.write(fraud_df.to_csv(index=False))
    output_files['fraud'] = base64.b64encode(open('fraud.csv', 'rb').read()).decode('utf-8')
    with open('legit.csv', 'w') as f:
        f.write(legit_df.to_csv(index=False))
    output_files['legit'] = base64.b64encode(open('legit.csv', 'rb').read()).decode('utf-8')

    # Display statistics about results
    num_fraud = int(input_df['is_fraud'].sum())
    total_records = int(len(input_df))
    fraud_pct = float(num_fraud / total_records * 100)
    print(f'Total number of fraud transactions: {num_fraud} out of {total_records} records ({fraud_pct:.2f}%)')

    # Return output files and statistics
    return {'files': output_files, 'num_fraud': num_fraud, 'total_records': total_records, 'fraud_pct': fraud_pct}


def formatFile(filename):
    # Load data from csv file
    df = pd.read_csv(filename)

    # Replace values in gender field
    df['gender'].replace({1: 'M', 0: 'F'}, inplace=True)

    # Perform reverse one-hot encoding on day columns
    days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    df['day'] = df[[f'day_{day}' for day in days]].apply(lambda x: days[x.values.argmax()], axis=1)
    df.drop([f'day_{day}' for day in days], axis=1, inplace=True)

    # Perform reverse one-hot encoding on category columns
    categories = ['entertainment', 'food_dining', 'gas_transport',
                  'grocery_net', 'grocery_pos', 'health_fitness',
                  'home', 'kids_pets', 'misc_net', 'misc_pos',
                  'personal_care', 'shopping_net', 'shopping_pos',
                  'travel']
    df['category'] = df[[f'category_{category}' for category in categories]].apply(
        lambda x: categories[x.values.argmax()], axis=1)
    df.drop([f'category_{category}' for category in categories], axis=1, inplace=True)

    # Perform reverse one-hot encoding on state columns
    states = ['AK', 'AL', 'AR', 'AZ', 'CA', 'CO', 'CT', 'DC', 'DE', 'FL', 'GA', 'HI', 'IA', 'ID', 'IL',
              'IN', 'KS', 'KY', 'LA', 'MA', 'MD', 'ME', 'MI', 'MN', 'MO', 'MS', 'MT', 'NC', 'ND', 'NE',
              'NH', 'NJ', 'NM', 'NV', 'NY', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC', 'SD', 'TN', 'TX', 'UT',
              'VA', 'VT', 'WA', 'WI', 'WV', 'WY']
    df['state'] = df[[f'state_{state}' for state in states]].apply(lambda x: states[x.values.argmax()], axis=1)
    df.drop([f'state_{state}' for state in states], axis=1, inplace=True)

    # Perform reverse one-hot encoding on cc_type columns
    cc_types = ['American Express', 'Diners Club - Carte Blanche', 'Discover', 'JCB', 'MasterCard', 'Other', 'Visa']
    df['cc_type'] = df[[f'cc_type_{cc_type}' for cc_type in cc_types]].apply(lambda x: cc_types[x.values.argmax()],
                                                                             axis=1)
    df.drop([f'cc_type_{cc_type}' for cc_type in cc_types], axis=1, inplace=True)

    # Perform reverse one-hot encoding on time_period columns
    time_periods = ['afternoon', 'dawn', 'evening', 'morning', 'night', 'noon']
    df['time_period'] = df[[f'time_period_{time_period}' for time_period in time_periods]].apply(
        lambda x: time_periods[x.values.argmax()], axis=1)
    df.drop([f'time_period_{time_period}' for time_period in time_periods], axis=1, inplace=True)

    # Save processed data to csv file
    output_files = {}
    with open('processed.csv', 'w') as f:
        df.to_csv('processed.csv', index=False)
    output_files['processed'] = base64.b64encode(open('processed.csv', 'rb').read()).decode('utf-8')

    # Return output files and statistics
    return {'files': output_files}


def getFraud():
    query = transactions_ref.order_by_child('isFraud').equal_to(1)
    results = query.get()
    return results

def getLegit():
    query = transactions_ref.order_by_child('isFraud').equal_to(0)
    results = query.get()
    return results

if __name__ == '__main__':
    print(load_saved_artifacts())
