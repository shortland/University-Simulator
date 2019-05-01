export class APIHandler {
    constructor({base_url = window.location + 'api/public/'} = {}) {
        this.base_url = base_url;
    }

    request = ({endpoint = 'get_creators', method = 'GET', data = '', callback} = {}) => {
        let defer = $.Deferred();
        $.ajax({
            url: this.base_url + endpoint + '?modular',
            method: method,
            data: data,
            dataType: 'json',
            async: false,
            cache: false,
            contentType: false,
            processData: false
        }).done((data) => {
            if (data['status'] == 'error') {
                console.log("ERROR", data);
                alert(data['message']);
                return;
            } else if (data['status'] !== 'ok') {
                console.log("NOK", data);
                return;
            } else {
                if (callback) {
                    defer.resolve(callback(data['data'] || data['message']));
                } else {
                    defer.resolve(data['data'] || data['message']);
                }
            }
        }).fail((jqXHR, textStatus, errorThrown) => {
            alert("An unexpected error occured. Please try again.");
            console.log("ERROR", errorThrown);
        });
        return defer.promise();
    }
}