import matplotlib.pyplot as plt
import plotly.plotly as py
import numpy as np

img = np.full([512,512],0,dtype=np.uint8)
for i in range(60):
    for j in range (20):
        img[226+i,246+j]=255
        
f = np.fft.fft2(img)
fshift = np.fft.fftshift(f)
magnitude_spectrum = 20*np.log(np.abs(fshift))

plt.subplot(121),plt.imshow(img, cmap = 'gray')
plt.title('Input Image'), plt.xticks([]), plt.yticks([])
plt.subplot(122),plt.imshow(magnitude_spectrum, cmap = 'gray')
plt.title('Magnitude Spectrum'), plt.xticks([]), plt.yticks([])
plt.show()