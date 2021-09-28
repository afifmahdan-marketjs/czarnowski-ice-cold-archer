import boto,os
conn = boto.connect_cloudfront(os.environ['AWS_ACCESS_KEY_ID_PRODUCTION'], os.environ['AWS_SECRET_ACCESS_KEY_PRODUCTION'])
folder_name = os.path.split(os.getcwd())[-1] # same as folder name
print "Invalidating files: "
paths = [
	'en/' + folder_name + '/index.html',
    'en/' + folder_name + '/game.js',
    'en/' + folder_name + '/promo.zip',
    # Add more files
]
for path in paths:
	print path
inval_req = conn.create_invalidation_request(u'EUDC8GM21FR4P', paths)

print 'Cloudfront invalidation done ... please check again after 5 minutes'