   /*
    * Copyright © 2015 Nuance Communications, Inc. All rights reserved.
    * Published by Nuance Communications, Inc.
    * One Wayside Road, Burlington, Massachusetts 01803, U.S.A.
    *
    * This sample is provided to help developers to write their own NCS access
    * libraries. This shows how to construct websockets messages/frames
    * containing NCS (Nuance Cloud Services) commands and arguments.
    * This example supports three types of requests:
    * 1. Text to Speech (TTS)
    * 2. Automatic Speech Recognition (ASR)
    * 3. Natural Language Processing (NLU)
    */

'use strict';
console.log("what the fuck");



(function(root, factory){
    root.Nuance = factory(root, {});
}(this, function(root, N){

    //
    // COMPAT. CHECKS

    var _ws = undefined;
    var _ttsTransactionId = 0;
    var _asrTransactionId = 1;
    var _nluTransactionId = 2;
    var _asrRequestId = 0;

    var _audioSource = undefined;
    var _audioSink = undefined;

    var _options = undefined;
    var _serviceUri = undefined;


    N.connect = function connect(options) {
        options = options || {};

        _options = options;
        _serviceUri = _url(options);

        _ws = new WebSocket(_serviceUri);

        _ws.onopen = function(){
            var deviceId = [
                nav.platform,
                nav.vendor,
                nav.language
            ].join('_').replace(/\s/g,'');

            _sendJSON({
                'message': 'connect',
                'user_id': options.userId,
                'codec': options.codec || 'audio/x-speex;mode=wb',
                'device_id': deviceId
            });

            options.onopen();
        };
        _ws.onmessage = function(msg) {
            var msgType = typeof(msg.data);
            switch (msgType) {
                case 'object':
                    _audioSink.play(msg.data);
                    break;
                case 'string':
                    options.onmessage(JSON.parse(msg.data));
                    break;
                default:
                    options.onmessage(msg.data);
            }
        };

        _ws.binaryType = 'arraybuffer';
        _ws.onclose = options.onclose;
        _ws.onerror = options.onerror;


    };

    N. disconnect =  function disconnect(){
        _ws.close();
    };


    // TTS
    // Input: text string
    // Output: audio will be played 
    N.playTTS = function playTTS(options) {
        _audioSink = new AudioSink();

        options = options || {};
        _ttsTransactionId += 2;
        var _start = {
            'message': 'query_begin',
            'transaction_id': _ttsTransactionId,

            'command': 'NMDP_TTS_CMD',
            'language': options.language || 'eng-USA',
            'codec': options.codec || 'audio/x-speex;mode=wb'
        };
        if(options.voice){
            _start['tts_voice'] = options.voice;
        }
        var _synthesize = {
            'message': 'query_parameter',
            'transaction_id': _ttsTransactionId,

            'parameter_name': 'TEXT_TO_READ',
            'parameter_type': 'dictionary',
            'dictionary': {
                'audio_id': 789,
                'tts_input': options.text || 'Text to speech from Nuance Communications',
                'tts_type': 'text'
            }
        };
        var _end = {
            'message': 'query_end',
            'transaction_id': _ttsTransactionId
        };

        _sendJSON(_start);
        _sendJSON(_synthesize);
        _sendJSON(_end);
    };

    N.startTextNLU = function startTextNLU(options){

        options = options || {};

        var _tId = (_nluTransactionId + _asrTransactionId + _ttsTransactionId);
        _nluTransactionId += 1;

        var _query_begin = {
            'message': 'query_begin',
            'transaction_id': _tId,

            'command': 'NDSP_APP_CMD',
            'language': options.language || 'eng-USA',
            'context_tag': options.tag,
        };

        var _query_parameter = {
            'message': 'query_parameter',
            'transaction_id': _tId,

            'parameter_name': 'REQUEST_INFO',
            'parameter_type': 'dictionary',

            'dictionary': {
                'application_data': {
                    'text_input': options.text,
                }
            }
        };

        var _query_end = {
            'message': 'query_end',
            'transaction_id': _tId,
        };

        _sendJSON(_query_begin);
        _sendJSON(_query_parameter);
        _sendJSON(_query_end);

    };


    N.startASR = function startASR(options) {
        options = options || {};
        _asrTransactionId += 2;
        _asrRequestId++;

        var _query_begin = {
            'message': 'query_begin',
            'transaction_id': _asrTransactionId,

            'language': options.language || 'eng-USA',
            'codec': 'audio/x-speex;mode=wb' // 16k
        };
        if(options.nlu) {
            _query_begin.command = 'NDSP_ASR_APP_CMD';
            _query_begin.context_tag = options.tag;
        } else {
            _query_begin.command = 'NVC_ASR_CMD';
            _query_begin.recognition_type =  options.tag || 'dictation';
        }

        var _request_info = {
            'message': 'query_parameter',
            'transaction_id': _asrTransactionId,

            'parameter_name': 'REQUEST_INFO',
            'parameter_type': 'dictionary',
            'dictionary': {
                'start': 0,
                'end': 0,
                'text': ''
            }
        };
        var _audio_info = {
            'message': 'query_parameter',
            'transaction_id': _asrTransactionId,

            'parameter_name': 'AUDIO_INFO',
            'parameter_type': 'audio',

            'audio_id': _asrRequestId
        };
        var _query_end = {
            'message': 'query_end',
            'transaction_id': _asrTransactionId
        };
        var _audio_begin = {
            'message': 'audio',
            'audio_id': _asrRequestId
        };


        _sendJSON(_query_begin);
        _sendJSON(_request_info);
        _sendJSON(_audio_info);
        _sendJSON(_query_end);
        _sendJSON(_audio_begin);

        _audioSource = new AudioSource(_ws, function(volume){
            _options.onmessage({message: 'volume', volume: volume});
        });
        _audioSource.start(options.userMedia);
    };

    N.stopASR = function stopASR() {
        _audioSource.stop();

        var _audio_end = {
            'message': 'audio_end',
            'audio_id': _asrRequestId
        };

        _sendJSON(_audio_end);
    };




    //Data Helpers

    var _sendJSON = function _sendJSON(json) {
        _ws.send(JSON.stringify(json));
    };

    var _url = function _url(options){
        var serviceUri = options.url || N.DEFAULT_URL;
        var params = [];
        params.push('app_id=' + options.appId);
        params.push('algorithm=key');
        params.push('app_key=' + options.appKey);
        serviceUri += params.join('&');
        return serviceUri;
    };

    return N;

}));

