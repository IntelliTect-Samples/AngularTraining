import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'formatTimespan'
})
export class FormatTimespanPipe implements PipeTransform {

    transform(value: number): string {
        var totalSeconds = value / 1000;

        var hours = Math.floor(totalSeconds / 3600);
        var minutes = Math.floor((totalSeconds - (3600 * hours)) / 60);
        var seconds = Math.floor(totalSeconds - ((minutes * 60) + (3600 * hours)));

        return `${hours}:${minutes > 9 ? "" + minutes : "0" + minutes}:${seconds > 9 ? "" + seconds : "0" + seconds}`;
    }

}
