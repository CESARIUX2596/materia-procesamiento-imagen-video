import numpy as np

import cv2
from matplotlib import pyplot as plt

img = cv2.imread('face.png')
color = ('b', 'g', 'r')
for i, col in enumerate(color):
    histr = cv2.calcHist([img],[i], None, [256], [0,256])
    plt.plot(histr,color = col)
    plt.xlim([0,256])
plt.show()

