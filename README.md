# Custom Sidebar

[![hacs_badge](https://img.shields.io/badge/HACS-Default-41BDF5.svg)](https://github.com/hacs/integration)
[![HACS Action](https://github.com/elchininet/custom-sidebar/actions/workflows/hacs.yaml/badge.svg)](https://github.com/elchininet/custom-sidebar/actions/workflows/hacs.yaml)
[![Tests](https://github.com/elchininet/custom-sidebar/actions/workflows/tests.yaml/badge.svg)](https://github.com/elchininet/custom-sidebar/actions/workflows/tests.yaml)
[![Coverage Status](https://coveralls.io/repos/github/elchininet/custom-sidebar/badge.svg?branch=master)](https://coveralls.io/github/elchininet/custom-sidebar?branch=master)
[![downloads](https://img.shields.io/github/downloads/elchininet/custom-sidebar/total)](https://github.com/elchininet/custom-sidebar/releases)

[![Home Assistant Nightly Beta Tests](https://github.com/elchininet/custom-sidebar/actions/workflows/ha-beta-tests.yaml/badge.svg)](https://github.com/elchininet/custom-sidebar/actions/workflows/ha-beta-tests.yaml)

Custom [HACS] plugin that allows you to personalise the [Home Assistant]'s sidebar per user or device basis

<table>
  <thead>
    <tr>
      <th width="25%">Default sidebar</th>
      <th width="25%">Hide/add some items</th>
      <th width="25%">Reorder items</th>
      <th width="25%">Personalise</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td colspan="4">
      </td>
    </tr>
    <tr>
      <td>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><img src="https://raw.githubusercontent.com/elchininet/custom-sidebar/master/images/default-sidebar.png" alt="default sidebar" /><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </td>
      <td>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><img src="https://raw.githubusercontent.com/elchininet/custom-sidebar/master/images/new-items.png" alt="hide and new items" /><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </td>
      <td>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><img src="https://raw.githubusercontent.com/elchininet/custom-sidebar/master/images/reorder-items.png" alt="reorder items" /><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </td>
      <td>
        &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;<br><img src="https://raw.githubusercontent.com/elchininet/custom-sidebar/master/images/personalise.png" alt="personalise" /><br>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
      </td>
    </tr>
  </tbody>
</table>

This is a refactor of [custom-sidebar-v2] by @galloween, which unfortunately is now unmaintained and archived. In its beginning, @galloween's code was a refactor of the [original Custom Sidebar] plugin by @Villhellm (R.I.P.). This version refactored completely @galloween's code allowing to use a configuration in `YAML` (as @Villhellm's one) or in `JSON` (as @galloween's version), fixing several bugs, improving performance, and using [home-assistant-query-selector] to make it less likely to break with future Home Assistant front-end updates.

## Installation and Configuration instructions 

Consult the [Custom Sidebar Docs]

---

### Credits and huge thanks to:

* [Villhellm](https://github.com/Villhellm) | Original creator of custom-sidebar (R.I.P.).
* [galloween](https://github.com/galloween) | forked the original `custom-sidebar` and maintained it for a while

[HACS]: https://hacs.xyz
[Home Assistant]: https://www.home-assistant.io
[custom-sidebar-v2]: https://github.com/galloween/custom-sidebar-v2
[original Custom Sidebar]: https://github.com/Villhellm/custom-sidebar
[home-assistant-query-selector]: https://github.com/elchininet/home-assistant-query-selector
[Custom Sidebar Docs]: https://elchininet.github.io/custom-sidebar/