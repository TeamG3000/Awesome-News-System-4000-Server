/* globals require module */

let passport = require("passport");

module.exports = function (data) {
    let allSimpleArticles = [];
    return {
        getSimpleArticles(req, res) {
            if (req.query.page === undefined) {
                req.query.page = 1;
            }

            if (isNaN(req.query.page)) {
                return res.status(404).json("page not found.");
            }

            data.getAllSourceItemsIds()
                .then(selectedMedia => {
                    if (req.isAuthenticated()) {
                        selectedMedia = [];
                        req.user.selectedMedia.forEach(media => {
                            selectedMedia.push(media.name);
                        });
                    }

                    data.getNewestSimpleArticles(req.query.page, selectedMedia)
                        .then(simpleArticles => {
                            if (req.headers["requester"] === "ajax") {
                                return res.status(200).json({
                                    simpleArticles: simpleArticles
                                });
                            } else {
                                return res.status(200).json({
                                    simpleArticles: simpleArticles,
                                    user: {
                                        username: req.user.username,
                                        settings: req.user.settings,
                                        selectedMedia: req.user.selectedMedia,
                                        favouriteArticles: req.user.favouriteArticles,
                                        token: req.user.token
                                    }
                                });
                            }
                        })
                        .catch(err => {
                            return res.status(404).json("Page not found.");
                        });
                });
        },
        getTopRatedArticles(req, res) {
            data.getTopOneHundredArticles()
                .then(topDetailedArticles => {
                    let promiseArr = [];
                    for (var index = 0; index < topDetailedArticles.length; index++) {
                        let simpleArticle = data.getSingleSimpleArticleByName(topDetailedArticles[index].title, topDetailedArticles[index].source)
                        promiseArr.push(simpleArticle);
                    }
                    return promiseArr;
                })
                .then(promiseArr => {
                    Promise.all(promiseArr)
                        .then(articles => {
                            return res.status(200).json({ topArticles: articles });
                        })
                        .catch(err => {
                            return res.status(404).json("top articles error");
                        });
                });
        }
    }
};