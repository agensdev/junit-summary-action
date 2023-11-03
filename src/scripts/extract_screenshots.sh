#/bin/sh
SEARCH_FOLDER="$1/*"
for f in $SEARCH_FOLDER
do
    if [ -d "$f" ]
    then
        for ff in $f/*
        do
            if ! [ -z "$(ls -A $ff)" ]; then
                echo "Scaling screenshots in $ff..."
                mogrify -scale 30% $ff/*.png
            fi
        done
    else
        echo "Processing file $f"
    fi
done

echo "Done!"