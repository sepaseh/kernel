import type { FormProps } from "antd";
import {
  Button,
  Card,
  Col,
  ColorPicker,
  Divider,
  Flex,
  Form,
  Row,
  Select,
} from "antd";
import { useCallback, useEffect, useState } from "react";
import { useTranslation } from "react-i18next";

import { useAntd, useCore } from "@/app/hooks";
import { getRoutePermissions } from "@/app/lib";
import { defaultLogos, themeColorFields } from "@/shared/config";
import { getErrorMessage } from "@/shared/lib";

import {
  fetchApplicationSettings,
  fetchLanguages,
  updateApplicationSettings,
} from "./api";
import { LogoUpload } from "./components/logo-upload";
import type {
  ApplicationLanguage,
  ApplicationSettings,
  ApplicationSettingsRequest,
} from "./types";

export const SettingsPage = () => {
  const { t } = useTranslation();
  const [languages, setLanguages] = useState<ApplicationLanguage[]>([]);
  const [languagesLoading, setLanguagesLoading] = useState(true);
  const [settings, setSettings] = useState<ApplicationSettings>();
  const [settingsLoading, setSettingsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const { messageAPI, modalAPI } = useAntd();
  const { setLanguage, setLogos, setThemePalettes, user } = useCore();
  const { canUpdate } = getRoutePermissions("settings", user);
  const [form] = Form.useForm<ApplicationSettingsRequest>();
  const loading = languagesLoading || settingsLoading;

  const setFormValues = useCallback(
    (value: ApplicationSettings) => {
      form.setFieldsValue({
        darkLogoId: value.darkLogo?.id,
        darkTheme: value.darkTheme,
        languageCode: value.language.code,
        lightLogoId: value.lightLogo?.id,
        lightTheme: value.lightTheme,
      });
    },
    [form],
  );

  const resetForm = () => {
    if (settings) setFormValues(settings);
  };

  const handleSubmit: FormProps<ApplicationSettingsRequest>["onFinish"] = (
    values,
  ) => {
    if (!canUpdate || submitting) return;

    const languageChanged = settings?.language.code !== values.languageCode;

    modalAPI.confirm({
      cancelText: t("no"),
      content: languageChanged ? t("languageChangeDescription") : undefined,
      okText: t("yes"),
      onOk: async () => {
        try {
          setSubmitting(true);

          const updatedSettings = await updateApplicationSettings(values);
          setSettings(updatedSettings);
          setLanguage(updatedSettings.language.code);
          setLogos({
            dark: updatedSettings.darkLogo?.url ?? defaultLogos.dark,
            light: updatedSettings.lightLogo?.url ?? defaultLogos.light,
          });
          setThemePalettes({
            dark: updatedSettings.darkTheme,
            light: updatedSettings.lightTheme,
          });
          setFormValues(updatedSettings);
          messageAPI.success(t("settingsUpdated"));
        } catch (error) {
          messageAPI.error(getErrorMessage(error));
        } finally {
          setSubmitting(false);
        }
      },
      title: t("settingsChangeConfirm"),
    });
  };

  useEffect(() => {
    void (async () => {
      try {
        const applicationSettings = await fetchApplicationSettings();
        setSettings(applicationSettings);
        setFormValues(applicationSettings);
      } catch (error) {
        messageAPI.error(getErrorMessage(error));
      } finally {
        setSettingsLoading(false);
      }
    })();
  }, [messageAPI, setFormValues]);

  useEffect(() => {
    void (async () => {
      try {
        setLanguages(await fetchLanguages());
      } catch (error) {
        messageAPI.error(getErrorMessage(error));
      } finally {
        setLanguagesLoading(false);
      }
    })();
  }, [messageAPI]);

  return (
    <Row>
      <Col xs={24} md={20} lg={16} xxl={12} xxxl={8}>
        <Form<ApplicationSettingsRequest>
          disabled={!canUpdate || loading || submitting}
          form={form}
          layout="vertical"
          onFinish={handleSubmit}
        >
          <Card loading={loading} size="small" variant="borderless">
            <Form.Item<ApplicationSettingsRequest>
              label={t("language")}
              name="languageCode"
              rules={[{ required: true }]}
            >
              <Select
                options={languages.map(({ code, nativeName }) => ({
                  label: nativeName,
                  value: code,
                }))}
              />
            </Form.Item>
            <Row gutter={[16, 16]}>
              {(["light", "dark"] as const).map((theme) => (
                <Col key={theme} xs={24} lg={12}>
                  <Divider
                    styles={{ content: { marginInline: 0 } }}
                    titlePlacement="start"
                  >
                    {t(theme === "light" ? "lightMode" : "darkMode")}
                  </Divider>
                  <Form.Item<ApplicationSettingsRequest>
                    label={t("logo")}
                    name={theme === "dark" ? "darkLogoId" : "lightLogoId"}
                  >
                    <LogoUpload
                      url={
                        settings?.[theme === "dark" ? "darkLogo" : "lightLogo"]
                          ?.url
                      }
                    />
                  </Form.Item>
                  {themeColorFields.map((field) => (
                    <Form.Item<ApplicationSettingsRequest>
                      getValueFromEvent={(color) => color.toHexString()}
                      key={field}
                      label={t(field)}
                      name={[
                        theme === "dark" ? "darkTheme" : "lightTheme",
                        field,
                      ]}
                    >
                      <ColorPicker
                        format="hex"
                        showText
                        style={{ width: "100%" }}
                      />
                    </Form.Item>
                  ))}
                </Col>
              ))}
            </Row>
            <Flex gap={8} justify="flex-end">
              <Button onClick={resetForm}>{t("reset")}</Button>
              <Button htmlType="submit" loading={submitting} type="primary">
                {t("submit")}
              </Button>
            </Flex>
          </Card>
        </Form>
      </Col>
    </Row>
  );
};
