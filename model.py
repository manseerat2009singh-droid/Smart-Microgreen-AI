from pathlib import Path
import pandas as pd, numpy as np
from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler
from sklearn.impute import SimpleImputer
from sklearn.linear_model import Ridge
from sklearn.model_selection import LeaveOneOut, cross_val_predict
from sklearn.metrics import r2_score, mean_absolute_error, mean_squared_error

ROOT=Path(__file__).parent
DATA=ROOT/'results'/'growth_dataset.csv'
MODEL=ROOT/'models'/'growth_model.joblib'

def train():
    df=pd.read_csv(DATA)
    # Predict Day 3 visual growth from cultivation conditions + Day 2 visual observations.
    if 3 not in set(df.day) or 2 not in set(df.day): raise ValueError('Need Day 2 and Day 3 data.')
    d2=df[df.day==2].copy(); d3=df[df.day==3].copy()
    keep=['box_id','seed_density','seed_soaking_time','biofertilizer','cocopeat','harvest_time','blackout_duration','nutrient_ec','nutrient_spray_start_day','media_thickness','seaweed','top_exg_mean','top_exg_positive_pct','top_green_pct']
    x=d2[keep].rename(columns={'top_exg_mean':'day2_exg_mean','top_exg_positive_pct':'day2_exg_positive_pct','top_green_pct':'day2_green_pct'})
    y=d3[['box_id','visual_growth_index']]
    z=x.merge(y,on='box_id')
    X=z.drop(columns=['box_id','visual_growth_index']); Y=z.visual_growth_index
    cats=['biofertilizer','seaweed']; nums=[c for c in X.columns if c not in cats]
    pre=ColumnTransformer([('num',Pipeline([('imp',SimpleImputer(strategy='median')),('sc',StandardScaler())]),nums),('cat',OneHotEncoder(handle_unknown='ignore'),cats)])
    pipe=Pipeline([('pre',pre),('model',Ridge(alpha=10.0))])
    loo=LeaveOneOut(); pred=cross_val_predict(pipe,X,Y,cv=loo)
    metrics={'r2':float(r2_score(Y,pred)),'mae':float(mean_absolute_error(Y,pred)),'rmse':float(mean_squared_error(Y,pred)**0.5),'n':len(Y)}
    pipe.fit(X,Y)
    import joblib; joblib.dump({'pipeline':pipe,'features':list(X.columns),'metrics':metrics},MODEL)
    pd.DataFrame({'box_id':z.box_id,'actual':Y,'predicted':pred}).to_csv(ROOT/'results'/'model_predictions.csv',index=False)
    return metrics

if __name__=='__main__':
    print(train())
