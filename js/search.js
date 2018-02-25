fetch("/lunr.json")
    .then(t => t.json())
    .then(documents => {

        // console.log(t);
        // const idx = lunr.Index.load(t);
        // console.log(idx);

        const idx = lunr(function() {
            this.ref('uri');
            this.field('content');
            this.metadataWhitelist = ['position'];

            documents.forEach(function (doc) {
                this.add(doc)
            }, this)
        });

        const results = idx.search("react");
        console.log(results);

        for (const result of results) {
            result.matchData
        }
    });