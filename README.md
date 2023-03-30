# Credit card fraud detection using ML

Find the dataset from here: https://www.kaggle.com/datasets/kartik2112/fraud-detection
<br/>

### Stats related to the dataset
Size: 1852394 rows and  23 columns<br/>
Train dataset:  (1296675, 23)<br/>
Test dataset:  (555719, 23)<br/>
#### Highly imbalanced
No of legit transactions : 1842743<br/>
No of fraud transactions: 9 651<br/>

## Methodology - building the binary classification model
##### Created 3 separate training data sets to figure out to the best resampling method for this dataset
1. Random Undersampling +  Cluster Centroid Undersampling
2. Random Undersampling +  SMOTE Oversampling
3. Random Undersampling + ADASYN Oversampling 
<br/><br/>
<img src="https://user-images.githubusercontent.com/69623047/228798491-bfb33c5a-029f-4c1b-9464-9ff47d1ea195.png" alt="image" style="width:60%;">

##### Trained 5 different models using all 3 separate datasets and used Grid Search CV algorithm for hyperparameter tuning
1. K Neighbors Classifier
2. Bagging Classifier  + Decision Tree Classifier 
3. ADA Boost Classifier + Decision Tree Classifier
4. Random Forest Classifier
5. Support Vector Machine

Summary is as below<br/>
<img src="https://user-images.githubusercontent.com/69623047/228793979-8859f928-6634-4bfe-95b6-c2d6e87a9d76.png" alt="image" style="width:40%;">
<br/>Models trained with Random under sampling + Cluster Centroid under sampling has the least no of total false predictions
<br/>Support Vector Machine is not suitable for this dataset
<br/>Grid Search CV algorithm selected Random Forest Classifier as the best model but it still has a higher no of false positives

<strong>I Combined the predictions of K Neighbours Classifier, and the 3 ensemble learning models Bagging Classifier + Decision Tree, ADA Boost Classifier + Decision Tree and Random Forest Classifier using a voting classifier to get better results<strong/>
<br/><br/>
<img src="https://user-images.githubusercontent.com/69623047/228796409-cfc5c89e-94ed-4a4e-96cd-056d8f8205b5.png" alt="image" style="width:40%;">
<br/><br/>
<table>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/69623047/228797030-7f06ff73-3c50-41c5-bb14-01d01fa3f50e.png" alt="Image 1"></td>
    <td><img src="https://user-images.githubusercontent.com/69623047/228797558-b2da72b6-c288-48f9-bf11-fe21a96433df.png" alt="Image 2"></td>
  </tr>
  <tr>
    <td><img src="https://user-images.githubusercontent.com/69623047/228800956-7fcfe552-26c3-4ac0-bbe4-4ebe13680450.png" alt="Image 3"></td>
    <td><img src="https://user-images.githubusercontent.com/69623047/228798117-f1901c77-e8a6-490c-a378-5897b9d198a3.png" alt="Image 4"></td>
  </tr>
</table>
<br/><br/>
<strong>Demo video for the application: https://drive.google.com/file/d/1FaLdLfddoxs-pPTTu6DCo9KRzYoIT8F8/view?usp=share_link </strong>


