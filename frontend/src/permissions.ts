/** Permisos del portal (maya-dashboard), alineados con maya_authorization. */
export const DASHBOARD_PERMISSIONS = {
  login: 'dashboard.login',
  dashboardUpdate: 'dashboard.dashboard.update',
  profileShow: 'profile.show',
  profileUpdate: 'profile.update',
  panelAlertsIndex: 'dashboard.panel_alerts.index',
  panelAlertsShow: 'dashboard.panel_alerts.show',
  panelAlertsCreate: 'dashboard.panel_alerts.create',
  panelAlertsUpdate: 'dashboard.panel_alerts.update',
  panelAlertsDelete: 'dashboard.panel_alerts.delete',
  panelAlertRulesIndex: 'dashboard.panel_alert_rules.index',
  panelAlertRulesShow: 'dashboard.panel_alert_rules.show',
  panelAlertRulesCreate: 'dashboard.panel_alert_rules.create',
  panelAlertRulesUpdate: 'dashboard.panel_alert_rules.update',
  panelAlertRulesDelete: 'dashboard.panel_alert_rules.delete',
} as const
