# -*- mode: ruby -*-
# vi: set ft=ruby :

Vagrant.configure(2) do |config|
  config.vm.box = "centos/7"

  # ホストPCとゲストPCのネットワークを構築
  config.vm.network "private_network", ip: "172.16.10.16"

  # ホストPCのこのフォルダをマウント ※2016年11月現在のcentos/7だと明示的に指定しないとエラーになる
  config.vm.synced_folder ".", "/vagrant", type: "virtualbox"

  # メモリサイズ
  config.vm.provider "virtualbox" do |vb|
      vb.memory = "1024"
  end

  # ゲストPCにansibleをインストールし共有フォルダのプレイブックを実行
  config.vm.provision "ansible_local" do |ansible|
    ansible.playbook = "vagrant-conf/playbook.yml"
    ansible.provisioning_path = "/vagrant/"
  end

  # 各種サービスが共有フォルダマウント前に起動してエラーになるので、再読み込みさせる
  config.vm.provision "shell", run: "always" do |s|
    s.inline = "sudo systemctl restart pm2"
  end
end