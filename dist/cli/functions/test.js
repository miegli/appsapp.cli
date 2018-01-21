var t=null, appsapp_cli_1 = require("appsapp-cli/appsapp-cli.umd"),Projekt_1 = function() {};

/**END_OF_APPSAPPS_INJECT_REQUIRE**/

var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });

var appsapp_cli_1 = require("appsapp-cli/appsapp-cli.umd");
console.log(appsapp_cli_1);
// var Projekt_1 = require("./Projekt");
// global.MitarbeiterProjekte = /** @class */ (function (_super) {
//     __extends(MitarbeiterProjekte, _super);
//     function MitarbeiterProjekte() {
//         var _this = _super !== null && _super.apply(this, arguments) || this;
//         _this.Projekte = [];
//         return _this;
//     }
//     __decorate([
//         appsapp_cli_1.IsString(), appsapp_cli_1.HasLabel('Name'),
//         __metadata("design:type", String)
//     ], MitarbeiterProjekte.prototype, "MitarbeiterName", void 0);
//     __decorate([
//         appsapp_cli_1.IsString(), appsapp_cli_1.HasLabel('Vorname'),
//         __metadata("design:type", String)
//     ], MitarbeiterProjekte.prototype, "Mitarbeitervorname", void 0);
//     __decorate([
//         appsapp_cli_1.IsString(), appsapp_cli_1.HasLabel('Kürzel'), appsapp_cli_1.MinLength(1), appsapp_cli_1.MaxLength(2),
//         __metadata("design:type", String)
//     ], MitarbeiterProjekte.prototype, "MitarbeiterKuerzel", void 0);
//     __decorate([
//         appsapp_cli_1.IsString(), appsapp_cli_1.HasLabel('SL Benutzer'), appsapp_cli_1.MinLength(1), appsapp_cli_1.MaxLength(2),
//         __metadata("design:type", String)
//     ], MitarbeiterProjekte.prototype, "Mitarbeiter_SLBenutzer", void 0);
//     __decorate([
//         appsapp_cli_1.IsList(Projekt_1.Projekt),
//         __metadata("design:type", Object)
//     ], MitarbeiterProjekte.prototype, "Projekte", void 0);
//     return MitarbeiterProjekte;
// }(appsapp_cli_1.PersistableModel));
