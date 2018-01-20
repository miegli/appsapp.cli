/**
 * Copyright (c) 2017 by Michael Egli
 *
 * Provides selectline API service
 *
 */

'use strict';

class Service {


    /**
     *
     * constructs the service
     * @param string apiEndpoint
     * @param string userName
     * @param string password
     * @return void
     *
     */
    init(apiEndpoint, userName, password) {

        /**
         * selectline config
         */
        this.config = {
            'Api': apiEndpoint + "/",
            'UserName': userName,
            'Password': password,
            'login': {
                'TokenType': null,
                'AccessToken': null
            }
        };

        /**
         * http request
         */
        this.request = require('request-promise');


        /**
         * authenticate selectline api
         *
         * @return mixed
         *
         */
        this.authenticate = function () {

            var self = this;
            return new Promise(function (resolve, reject) {

                self.request({
                    method: 'POST',
                    uri: self.config.Api + 'login',
                    body: {
                        'UserName': self.config.UserName,
                        'Password': self.config.Password
                    },
                    headers: {
                        'content-type': 'application/json'
                    },
                    rejectUnauthorized: false,
                    requestCert: true,
                    agent: false,
                    json: true // Automatically stringifies the body to JSON
                }).then(function (login) {

                    if (login.TokenType !== undefined && login.AccessToken !== undefined) {

                        self.config.login = {
                            'TokenType': login.TokenType,
                            'AccessToken': login.AccessToken
                        };
                        resolve();
                    }

                }).catch(function (err) {

                    self.config.login = {
                        'TokenType': false,
                        'AccessToken': false
                    };
                    reject(err);


                });


            });


        }


        return this;

    }


    /**
     * execute request against the api
     *
     * @param string uri
     * @param string method
     * @param mixed data (body request)
     * @param boolean isfinalcall
     * @return Promise
     *
     */
    call(uri, method, data, isfinalcall) {


        var self = this;

        return new Promise(function (resolve, reject) {

            self.request({
                method: method !== undefined ? method : 'GET',
                uri: self.config.Api + uri,
                body: data,
                headers: {
                    'AUTHORIZATION': self.config.login.TokenType + ' ' + self.config.login.AccessToken,
                    'content-type': 'application/json'
                },
                rejectUnauthorized: false,
                requestCert: true,
                agent: false,
                json: true // Automatically stringifies the body to JSON
            }).then(function (response) {
                resolve(response);
            }).catch(function (err) {

                if (isfinalcall) {
                    reject(err);
                } else {

                    if (err.response !== undefined && err.response.body.ResponseCode == '10-002') {
                        self.authenticate().then((data) => {
                            self.call(uri, method, data, true).then((response) => {
                                resolve(response);
                            }).catch((err) => {
                                reject(err);
                            });
                        }).catch((err) => {
                            reject(err);
                        });
                    } else {
                        reject(err);
                    }
                }

            });


        });


    }


}

module.exports = new Service;

