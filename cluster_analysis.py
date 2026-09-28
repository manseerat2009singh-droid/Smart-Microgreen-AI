from pathlib import Path
import pandas as pd
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
ROOT=Path(__file__).parent
df=pd.read_csv(ROOT/'results/growth_dataset.csv')
d=df[df.day==3].copy()
cols=['top_exg_mean','top_exg_positive_pct','top_green_pct','side_mean_exg_mean','side_mean_exg_positive_pct','side_mean_green_pct']
X=StandardScaler().fit_transform(d[cols].fillna(d[cols].median()))
km=KMeans(n_clusters=3,random_state=42,n_init=20)
d['cluster']=km.fit_predict(X)
means=d.groupby('cluster').visual_growth_index.mean().sort_values()
labels={means.index[0]:'Lower visual growth',means.index[1]:'Moderate visual growth',means.index[2]:'Higher visual growth'}
d['growth_category']=d.cluster.map(labels)
out=d[['box_id','visual_growth_index','growth_category']].sort_values('visual_growth_index',ascending=False)
out.to_csv(ROOT/'results/growth_clusters.csv',index=False)
print(out.to_string(index=False))
