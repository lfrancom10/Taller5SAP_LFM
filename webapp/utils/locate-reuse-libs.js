(function (sap) {
    fioriToolsGetManifestLibs = function (manifestPath) {
    var url = manifestPath;
    var result = "";
    var ui5Libs = [
    "sap.apf","sap.base","sap.chart","sap.collaboration","sap.f","sap.fe","sap.fileviewer","sap.gantt","sap.landvisz",
    "sap.m","sap.ndc","sap.ovp","sap.rules","sap.suite","sap.tnt","sap.ui","sap.uiext","sap.ushell","sap.uxap",
    "sap.viz","sap.webanalytics","sap.zen"
    ];
    return new Promise(function (resolve, reject) {
    $.ajax(url)
    .done(function (manifest) {
    if (manifest) {
    if (
    manifest["sap.ui5"] &&manifest["sap.ui5"].dependencies &&manifest["sap.ui5"].dependencies.libs
    ) {
    Object.keys(manifest["sap.ui5"].dependencies.libs).forEach(function (manifestLibKey) {
    if (!ui5Libs.some(function (substring) { return manifestLibKey === substring || manifestLibKey.startsWith(substring + "."); 
})) {
    if (result.length > 0) {
    result = result + "," + manifestLibKey;
    } else {
    result = manifestLibKey;
    }}}); } }
    resolve(result); })
    .fail(function (error) {
    reject(new Error("Could not fetch manifest at '" + manifestPath)); }); }); };
    sap.registerComponentDependencyPaths = function (manifestPath) {
    return fioriToolsGetManifestLibs(manifestPath).then(function (libs) {
    if (libs && libs.length > 0) {
    var url = "/sap/bc/ui2/app_index/ui5_app_info?id=" + libs;
    var sapClient = jQuery.sap.getUriParameters().get("sap-client");
    if (sapClient && sapClient.length === 3) {
    url = url + "&sap-client=" + sapClient; }
    return $.ajax(url).done(function (data) {
    if (data) {
    Object.keys(data).forEach(function (moduleDefinitionKey) {
    var moduleDefinition = data[moduleDefinitionKey];
    if (moduleDefinition && moduleDefinition.dependencies) {
    moduleDefinition.dependencies.forEach(function (dependency) {
    if (dependency.url && dependency.url.length > 0 && dependency.type === "UI5LIB") {
    jQuery.sap.log.info(
    "Registering Library " +
    dependency.componentId +
    " from server " +
    dependency.url);
    jQuery.sap.registerModulePath(dependency.componentId, dependency.url);} }); }}); }}); } }); };})
   (sap);
   var scripts = document.getElementsByTagName("script");
   var currentScript = scripts[scripts.length - 1];
   var manifestUri = currentScript.getAttribute("data-sap-ui-manifest-uri");
   var componentName = currentScript.getAttribute("data-sap-ui-componentName");
   var useMockserver = currentScript.getAttribute("data-sap-ui-use-mockserver");
   sap.registerComponentDependencyPaths(manifestUri)
    .catch(function (error) {
    jQuery.sap.log.error(error); })
    .finally(function () {
    if (componentName && componentName.length > 0) {
    if (useMockserver && useMockserver === "true") {
    sap.ui.getCore().attachInit(function () {
    sap.ui.require([componentName.replace(/\./g, "/") + "/localService/mockserver"], function (server) {
    // set up test service for local testing
    server.init();
    // initialize the ushell sandbox component
    sap.ushell.Container.createRenderer().placeAt("content"); }); }); } else { 
   sap.ui.require(["sap/ui/core/ComponentSupport"]);
    }} else { sap.ui.getCore().attachInit(function () {
    sap.ushell.Container.createRenderer().placeAt("content"); }); } });
   sap.registerComponentDependencyPaths(manifestUri);
   