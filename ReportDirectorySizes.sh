#! /bin/bash
echo "Size Report"
du -h -d 1 media

echo ""
echo "Promo"
du -h -s media/graphics/promo/

echo ""
echo "Graphics without promo"
du -h -s --exclude promo media/graphics/
echo ""
echo "Media without promo"
du -h -s --exclude promo media/

echo ""
echo "Audio MP3 Only"
du -h -s --exclude *.ogg media/audio

echo ""
echo "Audio OGG only"
du -h -s --exclude *.mp3 media/audio