#!/bin/sh

ls *.png | xargs -r -I FILE   magick FILE -thumbnail 576x1200 FILE_576.webp  
ls *.png | xargs -r -I FILE   magick FILE -thumbnail 720x1200 FILE_720.webp  
ls *.png | xargs -r -I FILE   magick FILE -thumbnail 960x1200 FILE_960.webp  
ls *.png | xargs -r -I FILE   magick FILE -thumbnail 1140x1200 FILE_1140.webp
ls *.png | xargs -r -I FILE   magick FILE -thumbnail 1440x1440 FILE_1440.webp
echo "Done for PNGs"