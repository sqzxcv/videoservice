
filename=`date "+%Y-%m-%d-%H-%M-%S"`_mutangxiaxia.zip

zip -q -r $filename ./websit0.1

scp $filename root@172.104.91.83:love