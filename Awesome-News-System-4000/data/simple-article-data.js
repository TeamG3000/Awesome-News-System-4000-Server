/* globals module Promise*/
module.exports = function(models) {
    let simpleArticle = models.simpleArticle;
    let detailedArticle= models.detailedArticle;
    return {
        getNewestSimpleArticles(page, selectedMedia) {
            return new Promise((resolve, reject) => {
                simpleArticle.paginate({ source: { $in: selectedMedia } }, { page: page, limit: 10, sort: { publishedAt: -1 } },
                    function(err, result) {
                        if (err) {
                            return reject(err);
                        }

                        if (page > result.pages) {
                            return reject(page);
                        }
                        result.docs.totalPages = result.pages;
                        return resolve(result.docs);
                    });
            });
        },
        getSimpleArticleById(id) {
            return new Promise((resolve, reject) => {
                simpleArticle.findOne({ _id: id }, (err, article) => {
                    if (err) {
                        return reject(err);
                    }

                    if (!article) {
                        return resolve(null);
                    }

                    let searchObj = {
                        source: article.source,
                        title: article.title
                    };

                    return resolve(searchObj);
                });
            });
        },
        getSimpleArticleByName(input) {
            return new Promise((resolve, reject) => {
                simpleArticle.find({ "title": { "$regex": String(input), "$options": "i" } }, (err, article) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(article || null);
                });
            });
        },
         getSingleSimpleArticleByName(title, source) {
            return new Promise((resolve, reject) => {
                simpleArticle.findOne({ "title": title ,"source":source }, (err, article) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(article || null);
                });
            });
        },
        getTopOneHundredArticles() {
            return new Promise((resolve, reject) => {
                detailedArticle.find({}, (err, articles) => {
                    if (err) {
                        return reject(err);
                    }
                    return resolve(articles);
                }).where('rating').gt(0).sort({ rating: -1 }).limit(100);
            });
        }
    }
}