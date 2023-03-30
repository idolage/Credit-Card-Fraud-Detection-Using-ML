import requests

def get_city_population():
    city = 'San Francisco'
    url = 'https://api.api-ninjas.com/v1/city?name={}'.format(city)
    response = requests.get(url, headers={'X-Api-Key': 'IvKRoEKCNPpILkyImE1ang==UE1EgFiwt3C6ddmR'})
    if response.status_code == requests.codes.ok:
        data = response.json()
        if isinstance(data, list):
            # if data is a list, assume it contains one dictionary
            data = data[0]
        return data["population"]
    else:
        print("Error:", response.status_code, response.text)


if __name__ == '__main__':
    population = get_city_population()
    print(population)