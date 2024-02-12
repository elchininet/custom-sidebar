# Custom Sidebar

[![hacs_badge](https://img.shields.io/badge/HACS-Custom-41BDF5.svg)](https://github.com/hacs/integration)
[![HACS Action](https://github.com/elchininet/custom-sidebar/actions/workflows/hacs.yaml/badge.svg)](https://github.com/elchininet/custom-sidebar/actions/workflows/hacs.yaml)
[![Tests](https://github.com/elchininet/custom-sidebar/actions/workflows/tests.yaml/badge.svg)](https://github.com/elchininet/custom-sidebar/actions/workflows/tests.yaml)
[![Coverage Status](https://coveralls.io/repos/github/elchininet/custom-sidebar/badge.svg?branch=master)](https://coveralls.io/github/elchininet/custom-sidebar?branch=master)

Custom [HACS] plugin that allows you to rearrange, hide, and add menu items to [Home Assistant]'s sidebar.

<table>
  <thead>
    <tr>
      <th width="25%">Default sidebar</th>
      <th width="25%">Hide some items</th>
      <th width="25%">Add new items</th>
      <th width="25%">Reorder items</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>
        <img src="https://raw.githubusercontent.com/elchininet/custom-sidebar/master/images/default-sidebar.png" alt="default sidebar" />
      </td>
      <td>
        <img src="https://raw.githubusercontent.com/elchininet/custom-sidebar/master/images/hide-items.png" alt="hide items" />
      </td>
      <td>
        <img src="https://raw.githubusercontent.com/elchininet/custom-sidebar/master/images/new-items.png" alt="new items" />
      </td>
      <td>
        <img src="https://raw.githubusercontent.com/elchininet/custom-sidebar/master/images/reorder-items.png" alt="reorder items" />
      </td>
    </tr>
  </tbody>
</table>

This is a refactor of [custom-sidebar-v2] by @galloween, which unfortunatelly is now unmaintained and archived. In its beginning, @galloween's code was a refactor of the [original Custom Sidebar] plugin by @Villhellm (R.I.P.). This version refactored completely @galloween's code allowing to use a configuration in `JSON` (as @galloween's version) or in `YAML` (as @Villhellm's one), fixing several bugs, improving performance, and using [home-assistant-query-selector] to make it less likely to break with future Home Assistant front-end updates.

## Installation

You can install the plugin manually or through [HACS], not both. If you install the plugin using the two installations methods you could have issues or errors.

### Through HACS

1. Go to `HACS` dashboard
2. Go to `Frontend`
3. Click on the three-dots icon in the top-right corner
4. Select `Custom repositories`
5. In the `repository` field insert `https://github.com/elchininet/custom-sidebar` and in the `category` select `Lovelace`
6. Click on `Add`
7. Click on `Explore and download repositories` button in the bottom-right of the screen
8. Search for `custom-sidebar` and install it
9. Add the url of the plugin as an [extra_module_url] in your `confgiguration.yaml` (unless you use [browser_mod]):

#### If you want to use a `JSON` configuration

```yaml
frontend:
  extra_module_url:
    - /hacsfiles/custom-sidebar/custom-sidebar-json.js?v1.0.0
```

#### If you want to use a `YAML` configuration

```yaml
frontend:
  extra_module_url:
    - /hacsfiles/custom-sidebar/custom-sidebar-yaml.js?v1.0.0
```

10. Make sure you add the correct version at the end of the URL (e.g. `?v=1.0.0`) because in this way you make Home Assistant to load the new version instead of a version stored in cache
12. Restart Home Assistant

### Manual installation

1. Download the latest [custom-sidebar release]
2. Copy `custom-sidebar-json.js` or `custom-sidebar-yaml.js` into `<config directory>/www/` (depending on the configuration format that you are going to use, `JSON` or `YAML`)
3. Add the url of the plugin as an [extra_module_url] in your `confgiguration.yaml` (unless you use [browser_mod]):

#### If you want to use a `JSON` configuration

```yaml
frontend:
  extra_module_url:
    - /local/custom-sidebar-json.js?v1.0.0
```

#### If you want to use a `YAML` configuration

```yaml
frontend:
  extra_module_url:
    - /local/custom-sidebar-yaml.js?v1.0.0
```

4. Make sure you add the correct version at the end of the URL (e.g. `?v=1.0.0`) because in this way you make Home Assistant to load the new version instead of a version stored in cache
5. Restart Home Assistant

## Configuration

Depending on the file that you have added to [extra_module_url], you will need to add your configuration in `JSON` or `YAML` format. If you used `custom-sidebar-json.js` you need to provide the configuration in `JSON` format. If you have used `custom-sidebar-yaml.js` you need to provide the configuration in `YAML` format.

Add a file named `sidebar-config.json` or `sidebar-config.yaml` into your `<config directory>/www/` directory. It could be easier if you copy the [example sidebar-config.json] or the [example sidebar-config.yaml] file, delete the `id` parameter, and edit it to match your needs.

### Configuration options

| Property           | Type                               | Required | Description |
| ------------------ | ---------------------------------- | -------- | ----------- |
| order              | Array of [items](#item-properties) | true     | List of items to process |
| title<sup>\*</sup> | String                             | false    | Custom title to replace the `Home Assistant` title |
| sidebar_editable   | Boolean                            | false    | If it is set to `false`, long press on the sidebar title will be ignored and the button to edit the sidebar in the profile panel will be disabled |

#### Item properties

| Property                  | Type    | Required  | Description |
| ------------------------- | ------- | --------- | ----------- |
| item                      | String  | true      | This is a string that will be used to match each sidebar item by its text, its `data-panel` attribute or its `href`. If the `exact` property is not set, it is case insensitive and it can be a substring such as `developer` instead of `Developer Tools` or `KITCHEN` instead of `kitchen-lights`. |
| match                     | String  | false     | This property will define which string will be used to match the `item` property. It has three possible values "text" (default) to match the text content of the element, "data-panel" to match the `data-panel` attribute of the element, or "href", to match the `href` attribute of the element |
| exact                     | Boolean | false     | Specifies whether the `item` string match should be an exact match (`true`) or not (`false`). |
| name<sup>\*</sup>         | String  | false     | Changes the name of the sidebar item |
| notification<sup>\*</sup> | String  | false     | Add a notification badge to the sidebar item |
| order                     | Number  | false     | Sets the order number of the sidebar item |
| bottom                    | Boolean | false     | Setting this property to `true` will group the item with the bottom items (Configuration, Developer Tools, etc)         |
| hide                      | Boolean | false     | Setting this property to `true` will hide the sidebar item |
| href                      | String  | false     | Specifies the `href` of the sidebar item |
| target                    | String  | false     | Specifies the [target property] of the sidebar item |
| icon                      | String  | false     | Specifies the icon of the sidebar item |
| new_item                  | Boolean | false     | Set this property to `true` to create a new item in the sidebar. **Using this option makes `href` and `icon` required properties** |

>\* These options and item properties allow [JavaScript templates](#javascript-templates).

Short example in `JSON` format:

```json5
{
  "title": "My Home",
  "order": [
    {
      "new_item": true,
      "item": "Google",
      "href": "https://mrdoob.com/projects/chromeexperiments/google-gravity/",
      "icon": "mdi:earth",
      "target": "_blank",
      "order": 1
    },
    {
      "item": "overview",
      "order": 2
    },
    {
      "new_item": true,
      "item": "Integrations",
      "href": "/config/integrations",
      "icon": "mdi:puzzle",
      "order": 3
    }
  ]
 }
```

Short example in `YAML` format:

```yaml
title: My Home
order:
  - new_item: true
    item: Google
    href: https://mrdoob.com/projects/chromeexperiments/google-gravity/
    icon: mdi:earth
    target: _blank
    order: 1
  - item: overview
    order: 2
  - new_item: true
    item: Integrations
    href: "/config/integrations"
    icon: mdi:puzzle
    order: 3
```

#### Notes

* All items in `config.order` should have a unique `item` property
* Avoid an `item` property that could match multiple elements. If you find that an item property matches with multiple elements, try to use the `match` and `exact` properties to match the specific item that you want to match.
* The items will be ordered according to their `order` property OR in the order of appearance
* If you use the `order` property, make sure either all items (except hidden ones) have this property, or none of them (otherwise order may be messed up)
* All the items placed in the bottom will be moved to the top by default. If you want to have some items in the bottom you need to add them to the `config.order` and specify their `bottom` property on `true`.
* Any items present in the Sidebar, but not in `config.order`, will be shown **on the bottom** of the top part of the list
* Notifications and user account are not part of the sidebar items so they will not be processed by this plugin

### Exceptions

You can define user-specific order using exceptions feature. Exceptions can be used if you would like to define an order for a specific user/device.

| Property   | Type    | Required | Description |
| ---------- | ------- | -------- | ----------- |
| order      | Array of [items](#item-properties) | true   | Defines the sidebar items order |
| base_order | Boolean | false   | If true, the `order` property will be merged with the root `config.order` array |
| user       | String or String[] | false   | Home Assistant user name(s) you would like to display this order for |
| not_user   | String or String[] | false   | Home Assistant user name(s) you wouldn't like to display this order for |
| device     | String or String[] | false   | Device(s) you would like to display this order for. E.g. ipad, iphone, macintosh, windows, android (it uses the device's [user-agent]) |
| not_device | String or String[] | false   | Device(s) you wouldn't like to display this order for. E.g. ipad, iphone, macintosh, windows, android (it uses the device's [user-agent]) |

Short example in `JSON` format:

```json5
{
  ...
  "exceptions": [
    {
      "user": ["Jim Hawkins", "Long John Silver"],
      "order": [
          ...
      ]
    }
  ]  
}
```

Short example in `YAML` format:

```yaml
...
exceptions:
  - user:
    - Jim Hawkins
    - Long John Silver
    order:
      ...
```

#### Notes

* You cannot use `user` and `not_user` at the same time, doing so will end in an error
* You cannot use `device` and `not_device` at the same time, doing so will end in an error
* Pay attention to `base_order` property. If it's set to `false` (default value), the main `config.order` will be ignored, leaving you with default sidebar modified only by the exception's orders

## JavaScript templates

Some config options and item properties, as `title`, `name` and `notification`, admit `JavaScript` templates. This templating system is not [the same that Home Assistant implements](https://www.home-assistant.io/docs/configuration/templating). It is basically a `JavaScript` code block in which you can use certain client-side objects, variables and methods. To set a property as a `JavaScript` template block, include the code between three square brackets `[[[ JavaScript code ]]]`. If you don‘t use the square brackets, the property will be interpreted as a regular string.

The `JavaScript` code will be taken as something that you want to return, but if you have a more complex logic, you can create your own variables and return the desired result at the end.

The entities and domains used in the templates will be stored so if the state of these entities change, it will update the templates used in the configuration.

### JavaScript templates example

The next example will set the title of the sidebar as "My Home" followed by the current time. It will also add the number of `HACS` updates as a notification in the `HACS` item in the sidebar. In case that there are no updates, an empty string is returned and in these cases the notification will not be displayed. And it also creates a new item that redirects to the `Home Assistant` info page with a dynamic text with the word "Info" followed by the installed Supervisor version  between parentheses.

#### in `JSON` format:

```json5
{
  "title": "[[[ 'My Home ' + new Date(states('sensor.date_time_iso')).toLocaleTimeString().slice(0, 5) ]]]",
  "order": [
    {
      "item": "hacs",
      "notification": "[[[ state_attr('sensor.hacs', 'repositories').length || '' ]]]"
    },
    {
      "new_item": true,
      "item": "info",
      "name": "[[[ 'Info (' + state_attr('update.home_assistant_supervisor_update', 'latest_version') + ')' ]]]",
      "href": "/config/info",
      "icon": "mdi:information-outline"
    }
  ]
}
```

#### in `YAML` format:

```yaml
title: '[[[ "My Home " + new Date(states("sensor.date_time_iso")).toLocaleTimeString().slice(0, 5) ]]]'
order:
  - item: hacs
    notification: '[[[ state_attr("sensor.hacs", "repositories").length || '' ]]]'
  - new_item: true
    item: info
    name: '[[[ "Info (" + state_attr("update.home_assistant_supervisor_update", "latest_version") + ")" ]]]'
    href: '/config/info'
    icon: mdi:information-outline
```

>Note: `Custom Sidebar` uses [Home Assistant Javascript Templates] for the templating system. To know all the objects, variables and methods available in the `JavaScript` templates, consult the [proper section](https://github.com/elchininet/home-assistant-javascript-templates?tab=readme-ov-file#objects-and-methods-available-in-the-templates) in the repository.

## Home Assistant built-in sidebar configuration options

Check out Home Assistant's native sidebar tools, maybe it will be enough for your needs.

* You can use HA's `panel_custom` integration to add internal links to the sidebar. Take a look at [this tutorial](https://home-assistant-guide.com/2021/12/08/how-to-add-internal-links-to-the-home-assistant-sidebar). Official [docs](https://www.home-assistant.io/integrations/panel_custom).
* You can use HA's `panel_iframe` integration to add external links. [See below](#combine-with-iframe-panel-to-show-external-content-inside-home-assitant). Official [docs](https://www.home-assistant.io/integrations/panel_iframe).
* You can click and hold the Home Assistant header on top of the sidebar and then it will allow you to add/remove and re-order some of the items (but not add new custom ones). This feature is also accessible from your profile settings (if you click on your username in the bottom left corner)

## Combine with Iframe Panel to show external content inside Home Assitant

If you use [Home Assistant's Iframe Panel feature] and have some iframe_panel links configured in `configuration.yaml`:

```yaml
panel_iframe:
  router:
    title: "Router"
    url: "http://192.168.1.1"
    icon: mdi:router-wireless
  fridge:
    title: "Fridge"
    url: "http://192.168.1.5"
    icon: mdi:fridge
```

Then you can modify them as the regular ones:

#### In `JSON` format

```json5
{
  "order": [
    { "item": "fridge" },
    { "item": "overview" },
    { "item": "router" }
    ...
  ]
}
```

#### In `YAML` format

```yaml
order:
  - item: fridge
  - item: overview
  - item: router
  ...
```

---

## Credits and huge thanks to:

* [Villhellm](https://github.com/Villhellm/custom-sidebar) | Original creator of custom-sidebar (R.I.P.).
* [galloween](https://github.com/galloween) | forked the `original custom-sidebar` and maintained it for a while

[HACS]: https://hacs.xyz
[Home Assistant]: https://www.home-assistant.io
[custom-sidebar-v2]: https://github.com/galloween/custom-sidebar-v2
[original Custom Sidebar]: https://github.com/Villhellm/custom-sidebar
[home-assistant-query-selector]: https://github.com/elchininet/home-assistant-query-selector
[extra_module_url]: https://www.home-assistant.io/integrations/frontend/#extra_module_url
[browser_mod]: https://github.com/thomasloven/hass-browser_mod
[custom-sidebar release]: https://github.com/elchininet/custom-sidebar/releases
[example sidebar-config.json]: https://raw.githubusercontent.com/elchininet/custom-sidebar/master/sidebar-config.json
[example sidebar-config.yaml]: https://raw.githubusercontent.com/elchininet/custom-sidebar/master/sidebar-config.yaml
[target property]: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/a#target
[user-agent]: https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/User-Agent
[Home Assistant Javascript Templates]: https://github.com/elchininet/home-assistant-javascript-templates
[Home Assistant's Iframe Panel feature]: https://www.home-assistant.io/integrations/panel_iframe/
